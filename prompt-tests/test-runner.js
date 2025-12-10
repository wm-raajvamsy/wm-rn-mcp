#!/usr/bin/env node

/**
 * Automated Test Runner for WaveMaker ReAct Agent (Gemini Edition)
 * 
 * Uses official @google/genai SDK with MCP server integration.
 * Based on: https://ai.google.dev/gemini-api/docs#javascript
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { validate } from './validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

class GeminiTestRunner {
  constructor() {
    this.mcpClient = null;
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    // Use minimal prompt for testing
    const promptPath = process.env.USE_FULL_PROMPT 
      ? '../WM_PROMPT.md' 
      : '../WM_PROMPT_MINIMAL.md';
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, promptPath), 
      'utf-8'
    );
    console.log(`${colors.blue}📄 Using prompt: ${promptPath}${colors.reset}`);
    // Rate limiting: 2 requests per minute (30 seconds between calls)
    this.lastApiCallTime = 0;
    this.minDelayMs = 30000; // 30 seconds = 2 requests/minute
    this.apiCallCount = 0;
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCallTime;
    
    if (timeSinceLastCall < this.minDelayMs && this.lastApiCallTime > 0) {
      const waitTime = this.minDelayMs - timeSinceLastCall;
      const seconds = Math.ceil(waitTime / 1000);
      console.log(`${colors.yellow}    ⏳ Rate limit: waiting ${seconds}s...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastApiCallTime = Date.now();
    this.apiCallCount++;
  }

  async connectMCP() {
    console.log(`${colors.cyan}📡 Connecting to MCP server...${colors.reset}`);
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [path.resolve(__dirname, '../build/index.js')]
    });
    
    this.mcpClient = new Client(
      { name: 'gemini-test-runner', version: '1.0.0' },
      { capabilities: {} }
    );
    
    await this.mcpClient.connect(transport);
    console.log(`${colors.green}✅ Connected to MCP server${colors.reset}\n`);
  }

  async runTest(testId) {
    console.log(`${colors.cyan}🧪 Running Test ${testId}${colors.reset}`);
    console.log(`${colors.yellow}⚡ Rate Limit: 2 requests/minute (30s delay between calls)${colors.reset}\n`);
    
    // 1. Load test scenario
    const expectedPath = path.join(__dirname, `expected/${testId}-button-widget.json`);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
    
    console.log(`${colors.blue}Query: ${expected.query}${colors.reset}\n`);
    
    // 2. Get MCP tools
    const { tools } = await this.mcpClient.listTools();
    console.log(`${colors.blue}Loaded ${tools.length} MCP tools${colors.reset}\n`);
    
    // 3. Run agent
    const capture = await this.runAgent(expected.query, tools, expected.paths);
    
    // 4. Save actual output
    const timestamp = Date.now();
    const actualPath = path.join(__dirname, `actual/${testId}-run-${timestamp}.json`);
    fs.writeFileSync(actualPath, JSON.stringify(capture, null, 2));
    console.log(`${colors.green}📝 Saved actual output: ${actualPath}${colors.reset}\n`);
    
    // 5. Validate
    const result = validate(expectedPath, actualPath);
    
    return result;
  }

  async runAgent(query, mcpTools, paths) {
    const capture = {
      testId: '',
      toolCalls: [],
      decisions: [],
      workingMemory: { session: {}, task: {} },
      answer: {}
    };
    
    // Format tools for Gemini - based on official docs
    const tools = [
      {
        functionDeclarations: mcpTools.map(tool => ({
          name: tool.name,
          description: tool.description || '',
          parameters: tool.inputSchema || { type: 'object', properties: {} }
        }))
      }
    ];
    
    // Debug: Log first few tool definitions
    if (process.env.DEBUG_TOOLS) {
      console.log(`${colors.cyan}🔧 Sample Tool Definitions:${colors.reset}`);
      tools[0].functionDeclarations.slice(0, 3).forEach(tool => {
        console.log(`\n  ${colors.yellow}${tool.name}${colors.reset}`);
        console.log(`  Description: ${tool.description.substring(0, 100)}...`);
      });
      console.log('');
    }
    
    // Config based on official sample
    const config = {
      temperature: 0,
      thinkingConfig: {
        thinkingBudget: 8192,
      },
      tools,
      toolConfig: {
        functionCallingConfig: {
          mode: 'AUTO' // Allow model to decide when to call functions
        }
      },
      systemInstruction: [
        {
          text: this.systemPrompt,
        }
      ],
    };
    
    const model = 'gemini-2.5-flash'; // Experimental model with better function calling
    
    // Build conversation - multi-turn via contents array
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: query,
          },
        ],
      },
    ];
    
    let iterationCount = 0;
    const maxIterations = 10;
    let pathsProvided = false;
    
    while (iterationCount < maxIterations) {
      iterationCount++;
      console.log(`${colors.blue}  Iteration ${iterationCount}${colors.reset}`);
      
      try {
        // Rate limiting before API call
        await this.waitForRateLimit();
        
        // Generate response with streaming
        const response = await this.ai.models.generateContentStream({
          model,
          config,
          contents,
        });
        
        let fullText = '';
        let functionCalls = [];
        
        // Collect chunks
        for await (const chunk of response) {
          if (chunk.functionCalls) {
            functionCalls.push(...chunk.functionCalls);
          }
          if (chunk.text) {
            fullText += chunk.text;
          }
        }
        
        // Add assistant response to conversation
        const assistantParts = [];
        if (fullText) {
          assistantParts.push({ text: fullText });
        }
        
        // Extract decisions and working memory from text
        if (fullText) {
          // Debug: save full response
          console.log(`${colors.yellow}    📄 Iteration ${iterationCount} Response:${colors.reset}`);
          console.log(fullText.substring(0, 1000) + (fullText.length > 1000 ? '...\n' : '\n'));
          
          this.extractDecisions(fullText, capture);
          this.extractWorkingMemory(fullText, capture);
        }
        
        // Handle function calls (tools)
        console.log(`${colors.cyan}    🔍 Function calls in response: ${functionCalls.length}${colors.reset}`);
        
        if (functionCalls.length > 0) {
          console.log(`${colors.yellow}    🔧 ${functionCalls.length} tool(s) called${colors.reset}`);
          
          // Add function call parts to assistant message
          functionCalls.forEach(call => {
            assistantParts.push({
              functionCall: {
                name: call.name,
                args: call.args
              }
            });
          });
          
          // Add assistant message
          contents.push({
            role: 'model',
            parts: assistantParts
          });
          
          // Execute tools and add responses
          const functionResponseParts = [];
          
          for (const call of functionCalls) {
            console.log(`${colors.yellow}       → ${call.name}${colors.reset}`);
            
            capture.toolCalls.push({
              tool: call.name,
              params: call.args
            });
            
            try {
              const mcpResult = await this.mcpClient.callTool({
                name: call.name,
                arguments: call.args
              });
              
              const resultText = mcpResult.content[0]?.text || JSON.stringify(mcpResult.content);
              
              functionResponseParts.push({
                functionResponse: {
                  name: call.name,
                  response: { result: resultText }
                }
              });
            } catch (error) {
              console.error(`${colors.red}       ❌ Error: ${error.message}${colors.reset}`);
              functionResponseParts.push({
                functionResponse: {
                  name: call.name,
                  response: { error: error.message }
                }
              });
            }
          }
          
          // Add function responses as user message
          contents.push({
            role: 'user',
            parts: functionResponseParts
          });
          
        } else {
          // No function calls - check for BLOCK or COMPLETE
          contents.push({
            role: 'model',
            parts: assistantParts
          });
          
          if ((fullText.includes('DECISION: BLOCK') || fullText.includes('**Decision: BLOCK**')) && !pathsProvided) {
            console.log(`${colors.yellow}    🚫 BLOCK: Providing paths${colors.reset}`);
            
            // Provide paths
            contents.push({
              role: 'user',
              parts: [{
                text: `Here are the paths:\nruntimePath: ${paths.runtimePath}\ncodegenPath: ${paths.codegenPath}`
              }]
            });
            pathsProvided = true;
            
          } else if (fullText.includes('DECISION: COMPLETE') || fullText.includes('**Decision: COMPLETE**')) {
            console.log(`${colors.green}    ✅ COMPLETE${colors.reset}\n`);
            this.extractAnswer(fullText, capture);
            break;
            
          } else {
            // Agent finished without explicit COMPLETE
            console.log(`${colors.blue}    ℹ️  Agent finished${colors.reset}\n`);
            this.extractAnswer(fullText, capture);
            break;
          }
        }
        
      } catch (error) {
        console.error(`${colors.red}    ❌ API Error: ${error.message}${colors.reset}`);
        break;
      }
    }
    
    if (iterationCount >= maxIterations) {
      console.log(`${colors.yellow}⚠️  Max iterations reached${colors.reset}\n`);
    }
    
    console.log(`${colors.cyan}📊 API calls made: ${this.apiCallCount}${colors.reset}\n`);
    
    return capture;
  }

  extractDecisions(text, capture) {
    const decisionMatch = text.match(/\*\*Decision:\s*(BLOCK|CONTINUE|COMPLETE|ADJUST_PLAN)\*\*/i);
    if (decisionMatch && !capture.decisions.includes(decisionMatch[1])) {
      capture.decisions.push(decisionMatch[1]);
    }
  }

  extractWorkingMemory(text, capture) {
    // Session context
    const sessionSection = text.match(/### Session Context[\s\S]*?\n([\s\S]*?)(?=\n###|\n\*\*|$)/);
    if (sessionSection) {
      const keys = [...sessionSection[1].matchAll(/[-•]\s*(\w+):/g)];
      keys.forEach(match => {
        capture.workingMemory.session[match[1]] = true;
      });
    }
    
    // Task context
    const taskSection = text.match(/### Task Context[\s\S]*?\n([\s\S]*?)(?=\n###|\n\*\*|$)/);
    if (taskSection) {
      const keys = [...taskSection[1].matchAll(/[-•]\s*(\w+):/g)];
      keys.forEach(match => {
        capture.workingMemory.task[match[1]] = true;
      });
    }
  }

  extractAnswer(text, capture) {
    // Find the final answer section
    const answerSection = text.substring(text.indexOf('## 🎯'));
    if (!answerSection) return;
    
    // Extract props from table
    const propsMatches = [...answerSection.matchAll(/\|\s*`?(\w+)`?\s*\|/g)];
    capture.answer.propsDocumented = propsMatches
      .map(m => m[1])
      .filter(p => p !== 'Prop' && p !== 'Type' && p !== 'Required' && p !== 'Default' && p !== 'Description');
    
    // Extract events
    const eventMatches = [...answerSection.matchAll(/\*\*(\w+)\*\*\s*-\s*`\([^)]+\)\s*=>/g)];
    capture.answer.eventsDocumented = eventMatches.map(m => m[1]);
    
    // Extract style classes
    const styleMatches = [...answerSection.matchAll(/`(btn-[\w-]+|fab-btn|mini-fab-btn)`/g)];
    capture.answer.styleClassesDocumented = [...new Set(styleMatches.map(m => m[1]))];
    
    // Structural checks
    capture.answer.hasPropsTable = /\|\s*Prop\s*\|/.test(answerSection);
    capture.answer.hasEventsSection = /###.*Events?/i.test(answerSection);
    capture.answer.hasStyleSection = /###.*Style|Built-in Style Classes/i.test(answerSection);
    capture.answer.codeExamples = (answerSection.match(/```tsx/g) || []).length;
    capture.answer.sections = (answerSection.match(/###\s+/g) || []).length;
    capture.answer.hasEvidenceTrail = /Evidence.*Trail|Tools Used/i.test(answerSection);
    capture.answer.isActionable = capture.answer.codeExamples >= 2;
    capture.answer.examplesRunnable = capture.answer.codeExamples > 0;
  }

  async close() {
    if (this.mcpClient) {
      await this.mcpClient.close();
      console.log(`${colors.cyan}👋 Disconnected from MCP${colors.reset}`);
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
${colors.cyan}WaveMaker ReAct Agent Test Runner (Gemini)${colors.reset}

Usage:
  node test-runner.js --test <testId>
  
Example:
  node test-runner.js --test 1.1
  
Environment Variables:
  GEMINI_API_KEY=AIza...    (required)
  
Model:
  gemini-2.0-flash-exp (optimal for function calling)
  
Rate Limiting:
  ${colors.yellow}⚡ 2 requests/minute (30s delay between calls)${colors.reset}
  Prevents quota exhaustion on free tier
  
Documentation:
  https://ai.google.dev/gemini-api/docs#javascript
    `);
    process.exit(0);
  }
  
  if (!process.env.GEMINI_API_KEY) {
    console.error(`${colors.red}❌ GEMINI_API_KEY environment variable not set${colors.reset}`);
    console.log(`\nGet your API key: https://aistudio.google.com/apikey`);
    process.exit(1);
  }
  
  const testId = args[args.indexOf('--test') + 1];
  
  if (!testId) {
    console.error(`${colors.red}❌ Test ID required${colors.reset}`);
    console.log(`Usage: node test-runner.js --test 1.1`);
    process.exit(1);
  }
  
  const runner = new GeminiTestRunner();
  
  try {
    await runner.connectMCP();
    const result = await runner.runTest(testId);
    await runner.close();
    
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    await runner.close();
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GeminiTestRunner };

