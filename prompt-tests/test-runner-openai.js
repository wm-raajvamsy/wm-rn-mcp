#!/usr/bin/env node

/**
 * Automated Test Runner for WaveMaker ReAct Agent (OpenAI Edition)
 * 
 * Uses OpenAI API with MCP server integration.
 * OpenAI models (GPT-4) excel at following complex ReAct patterns.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
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

class OpenAITestRunner {
  constructor() {
    this.mcpClient = null;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // Use widget understanding prompt
    const promptPath = process.env.USE_FULL_PROMPT 
      ? '../WM_PROMPT.md' 
      : '../WM_WIDGET_PROMPT.md';  // New generic prompt
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, promptPath), 
      'utf-8'
    );
    console.log(`${colors.blue}📄 Using prompt: ${promptPath}${colors.reset}`);
    this.apiCallCount = 0;
  }

  async connectMCP() {
    console.log(`${colors.cyan}📡 Connecting to MCP server...${colors.reset}`);
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [path.resolve(__dirname, '../build/index.js')]
    });
    
    this.mcpClient = new Client(
      { name: 'openai-test-runner', version: '1.0.0' },
      { capabilities: {} }
    );
    
    await this.mcpClient.connect(transport);
    console.log(`${colors.green}✅ Connected to MCP server${colors.reset}\n`);
  }

  async runTest(testId) {
    console.log(`${colors.cyan}🧪 Running Test ${testId}${colors.reset}\n`);
    
    // 1. Load test scenario (auto-detect file by test ID)
    const expectedDir = path.join(__dirname, 'expected');
    const expectedFiles = fs.readdirSync(expectedDir);
    const expectedFile = expectedFiles.find(f => f.startsWith(`${testId}-`));
    
    if (!expectedFile) {
      throw new Error(`No expected file found for test ${testId} in ${expectedDir}`);
    }
    
    const expectedPath = path.join(expectedDir, expectedFile);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
    
    console.log(`${colors.blue}Test: ${expected.testName}${colors.reset}`);
    
    console.log(`${colors.blue}Query: ${expected.query}${colors.reset}\n`);
    
    // 2. Get MCP tools
    const { tools } = await this.mcpClient.listTools();
    console.log(`${colors.blue}Loaded ${tools.length} MCP tools${colors.reset}\n`);
    
    // 3. Run agent
    const capture = await this.runAgent(expected.query, tools, expected.paths, testId);
    
    // 4. Save actual output
    const timestamp = Date.now();
    const actualPath = path.join(__dirname, `actual/${testId}-run-${timestamp}.json`);
    fs.writeFileSync(actualPath, JSON.stringify(capture, null, 2));
    console.log(`${colors.green}📝 Saved actual output: ${actualPath}${colors.reset}\n`);
    
    // 5. Validate
    const result = validate(expectedPath, actualPath);
    
    return result;
  }

  async runAgent(query, mcpTools, paths, testId = '') {
    const capture = {
      testId: testId,
      toolCalls: [],
      decisions: [],
      workingMemory: { session: {}, task: {} },
      answer: {}
    };
    
    // Format tools for GPT-5 API
    const tools = mcpTools.map(tool => ({
      type: 'function',
      name: tool.name,
      description: tool.description || '',
      parameters: tool.inputSchema || { type: 'object', properties: {} }
    }));
    
    // Build input list for GPT-5
    const input = [
      {
        role: 'user',
        content: `${query}

IMPORTANT: You MUST follow the instructions provided. Start by analyzing the query, then call tools one at a time to gather accurate information from the codebase. Do NOT provide answers without using tools.`
      }
    ];
    
    let iterationCount = 0;
    const maxIterations = 15;
    let pathsProvided = false;
    const allResponses = []; // Store all responses for logging
    
    while (iterationCount < maxIterations) {
      iterationCount++;
      console.log(`${colors.blue}  Iteration ${iterationCount}${colors.reset}`);
      
      try {
        // Call OpenAI GPT-5 with new API
        this.apiCallCount++;
        const response = await this.openai.responses.create({
          model: 'gpt-5-nano',
          instructions: this.systemPrompt,
          tools: tools,
          temperature: 1,  // Required for gpt-5-nano
          max_output_tokens: 16000,  // Maximum output tokens for complete responses
          input: input,
        });
        
        // Extract text and function calls from output
        let textContent = '';
        const functionCalls = [];
        
        response.output.forEach((item) => {
          if (item.type === 'message' && item.content) {
            // Content is an array of objects with type and text
            if (Array.isArray(item.content)) {
              item.content.forEach(contentItem => {
                if (contentItem.type === 'output_text' && contentItem.text) {
                  textContent += contentItem.text;
                }
              });
            }
          } else if (item.type === 'function_call') {
            functionCalls.push(item);
          }
        });
        
        // Store response for logging (will be updated with tool results)
        const currentResponse = {
          iteration: iterationCount,
          text: textContent,
          functionCalls: [],
          toolResults: [],
          userInteraction: null
        };
        allResponses.push(currentResponse);
        
        // Debug: Log full response if no content extracted
        if (!textContent && !functionCalls.length) {
          console.log(`${colors.red}    ⚠️  No content extracted. Raw response:${colors.reset}`);
          console.log(JSON.stringify(response.output, null, 2).substring(0, 1000));
        }
        
        // Debug output
        if (textContent) {
          console.log(`${colors.yellow}    📄 Response:${colors.reset}`);
          console.log(textContent.substring(0, 500) + (textContent.length > 500 ? '...\n' : '\n'));
        }
        
        console.log(`${colors.cyan}    🔍 Function calls in response: ${functionCalls.length}${colors.reset}`);
        
        // Extract decisions and working memory from text
        if (textContent) {
          this.extractDecisions(textContent, capture);
          this.extractWorkingMemory(textContent, capture);
        }
        
        // Handle function calls
        if (functionCalls.length > 0) {
          console.log(`${colors.yellow}    🔧 ${functionCalls.length} tool(s) called${colors.reset}`);
          
          // First, add all function calls to input
          for (const functionCall of functionCalls) {
            const callId = functionCall.call_id || functionCall.id;
            input.push({
              type: 'function_call',
              call_id: callId,
              name: functionCall.name,
              arguments: functionCall.arguments
            });
          }
          
          // Then execute and add results
          for (const functionCall of functionCalls) {
            console.log(`${colors.yellow}       → ${functionCall.name}${colors.reset}`);
            console.log(`${colors.cyan}       call_id: ${functionCall.call_id || functionCall.id}${colors.reset}`);
            
            const functionArgs = JSON.parse(functionCall.arguments);
            
            capture.toolCalls.push({
              tool: functionCall.name,
              params: functionArgs
            });
            
            // Log function call details
            currentResponse.functionCalls.push({
              name: functionCall.name,
              params: functionArgs
            });
            
            try {
              const mcpResult = await this.mcpClient.callTool({
                name: functionCall.name,
                arguments: functionArgs
              });
              
              const resultText = mcpResult.content[0]?.text || JSON.stringify(mcpResult.content);
              
              // Log tool result (truncate if too long)
              currentResponse.toolResults.push({
                tool: functionCall.name,
                result: resultText.substring(0, 500) + (resultText.length > 500 ? '... (truncated)' : '')
              });
              
              // Add function result to input - use id or call_id
              const callId = functionCall.call_id || functionCall.id;
              input.push({
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify({ result: resultText })
              });
              console.log(`${colors.green}       ✅ Added result with call_id: ${callId}${colors.reset}`);
            } catch (error) {
              console.error(`${colors.red}       ❌ Error: ${error.message}${colors.reset}`);
              const callId = functionCall.call_id || functionCall.id;
              
              // Log error
              currentResponse.toolResults.push({
                tool: functionCall.name,
                error: error.message
              });
              
              input.push({
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify({ error: error.message })
              });
            }
          }
          
        } else {
          // No function calls - check for BLOCK or COMPLETE
          if ((textContent.includes('<DECISION>BLOCK</DECISION>') ||
               textContent.includes('DECISION: BLOCK') || 
               textContent.includes('**Decision: BLOCK**') || 
               textContent.includes('need') && textContent.includes('paths')) && !pathsProvided) {
            console.log(`${colors.yellow}    🚫 BLOCK: Providing paths${colors.reset}`);
            
            // Provide paths
            const pathsMessage = `Here are the paths:\nruntimePath: ${paths.runtimePath}\ncodegenPath: ${paths.codegenPath}`;
            input.push({
              role: 'user',
              content: pathsMessage
            });
            pathsProvided = true;
            
            // Log user interaction
            currentResponse.userInteraction = pathsMessage;
            
          } else if (textContent.includes('<DECISION>COMPLETE</DECISION>') ||
                     textContent.includes('DECISION: COMPLETE') || 
                     textContent.includes('**Decision: COMPLETE**') ||
                     textContent.match(/##.*How to Use/i)) {
            console.log(`${colors.green}    ✅ COMPLETE${colors.reset}\n`);
            
            // Save complete response to log file
            const timestamp = Date.now();
            const logPath = `./logs/response-${capture.testId || 'test'}-${timestamp}.txt`;
            fs.writeFileSync(logPath, textContent, 'utf-8');
            console.log(`${colors.cyan}💾 Saved final response to: ${logPath}${colors.reset}\n`);
            
            // DEBUG: Show raw answer
            console.log(`${colors.cyan}📄 RAW ANSWER (first 2000 chars):${colors.reset}`);
            console.log(textContent.substring(0, 2000));
            console.log(`${colors.cyan}... (total length: ${textContent.length})${colors.reset}\n`);
            
            this.extractAnswer(textContent, capture);
            
            // DEBUG: Show extracted data
            console.log(`${colors.cyan}📊 EXTRACTED DATA:${colors.reset}`);
            console.log(`Props: ${capture.answer.propsDocumented.length}`);
            console.log(`Events: ${capture.answer.eventsDocumented.length}`);
            console.log(`Styles: ${capture.answer.styleClassesDocumented.length}`);
            console.log(`Has Props Table: ${capture.answer.hasPropsTable}`);
            console.log(`Has Events Section: ${capture.answer.hasEventsSection}`);
            console.log(`Code Examples: ${capture.answer.codeExamples}\n`);
            
            // DEBUG: Show context extraction
            console.log(`${colors.cyan}📋 CONTEXT MANAGEMENT:${colors.reset}`);
            console.log(`Session context keys: ${Object.keys(capture.workingMemory.session).join(', ') || 'none'}`);
            console.log(`Task context keys: ${Object.keys(capture.workingMemory.task).join(', ') || 'none'}`);
            console.log(`Decisions: ${capture.decisions.join(', ') || 'none'}\n`);
            
            break;
            
          } else {
            // Agent finished without explicit COMPLETE
            console.log(`${colors.blue}    ℹ️  Agent finished${colors.reset}\n`);
            this.extractAnswer(textContent, capture);
            break;
          }
        }
        
      } catch (error) {
        console.error(`${colors.red}    ❌ API Error: ${JSON.stringify(error)}${colors.reset}`);
        break;
      }
    }
    
    if (iterationCount >= maxIterations) {
      console.log(`${colors.yellow}⚠️  Max iterations reached${colors.reset}\n`);
    }
    
    // Save all responses to log file
    const timestamp = Date.now();
    const logPath = `./logs/response-${testId || 'test'}-${timestamp}.log`;
    
    const logContent = [
      `${'='.repeat(80)}`,
      `TEST: ${testId || 'unknown'}`,
      `TIMESTAMP: ${new Date(timestamp).toISOString()}`,
      `TOTAL ITERATIONS: ${iterationCount}`,
      `API CALLS: ${this.apiCallCount}`,
      `${'='.repeat(80)}`,
      '',
      ...allResponses.map((resp) => {
        const parts = [
          `${'='.repeat(80)}`,
          `ITERATION ${resp.iteration}`,
          `${'='.repeat(80)}`,
          ''
        ];
        
        // User interaction
        if (resp.userInteraction) {
          parts.push('👤 USER INTERACTION:');
          parts.push(resp.userInteraction);
          parts.push('');
        }
        
        // Function calls
        if (resp.functionCalls.length > 0) {
          parts.push('🔧 FUNCTION CALLS:');
          resp.functionCalls.forEach(fc => {
            parts.push(`  - ${fc.name}`);
            parts.push(`    Params: ${JSON.stringify(fc.params, null, 2).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n')}`);
          });
          parts.push('');
        }
        
        // Tool results
        if (resp.toolResults.length > 0) {
          parts.push('📦 TOOL RESULTS:');
          resp.toolResults.forEach(tr => {
            parts.push(`  - ${tr.tool}`);
            if (tr.error) {
              parts.push(`    ❌ Error: ${tr.error}`);
            } else {
              parts.push(`    Result: ${tr.result}`);
            }
          });
          parts.push('');
        }
        
        // Agent response
        if (resp.text) {
          parts.push('🤖 AGENT RESPONSE:');
          parts.push(resp.text);
          parts.push('');
        }
        
        return parts.join('\n');
      }),
      '',
      `${'='.repeat(80)}`,
      'FINAL EXTRACTION',
      `${'='.repeat(80)}`,
      `Props documented: ${capture.answer.propsDocumented?.length || 0}`,
      `Events documented: ${capture.answer.eventsDocumented?.length || 0}`,
      `Style classes: ${capture.answer.styleClassesDocumented?.length || 0}`,
      `Code examples: ${capture.answer.codeExamples || 0}`,
      `Session context: ${Object.keys(capture.workingMemory.session).join(', ') || 'none'}`,
      `Task context: ${Object.keys(capture.workingMemory.task).join(', ') || 'none'}`,
      `Decisions: ${capture.decisions.join(', ') || 'none'}`,
      `${'='.repeat(80)}`
    ].join('\n');
    
    fs.writeFileSync(logPath, logContent, 'utf-8');
    console.log(`${colors.cyan}💾 Saved complete conversation to: ${logPath}${colors.reset}\n`);
    
    console.log(`${colors.cyan}📊 API calls made: ${this.apiCallCount}${colors.reset}\n`);
    
    return capture;
  }

  extractDecisions(text, capture) {
    // Extract from <DECISION> tags
    const decisionMatches = text.matchAll(/<DECISION>(BLOCK|CONTINUE|COMPLETE|ADJUST_PLAN)<\/DECISION>/gi);
    for (const match of decisionMatches) {
      const decision = match[1].toUpperCase();
      if (!capture.decisions.includes(decision)) {
        capture.decisions.push(decision);
      }
    }
    
    // Fallback: markdown format for backwards compatibility
    const markdownMatches = text.matchAll(/\*\*Decision:\s*(BLOCK|CONTINUE|COMPLETE|ADJUST_PLAN)\*\*/gi);
    for (const match of markdownMatches) {
      const decision = match[1].toUpperCase();
      if (!capture.decisions.includes(decision)) {
        capture.decisions.push(decision);
      }
    }
  }

  extractWorkingMemory(text, capture) {
    // Extract from <CONTEXT> tags
    const contextMatch = text.match(/<CONTEXT>\s*([\s\S]*?)\s*<\/CONTEXT>/);
    if (contextMatch) {
      const contextText = contextMatch[1];
      
      // Extract session context
      const sessionSection = contextText.match(/Session Context:\s*([\s\S]*?)(?=Task Context:|$)/);
      if (sessionSection) {
        const keys = [...sessionSection[1].matchAll(/[-•]\s*(\w+):/g)];
        keys.forEach(match => {
          capture.workingMemory.session[match[1]] = true;
        });
      }
      
      // Extract task context
      const taskSection = contextText.match(/Task Context:\s*([\s\S]*?)$/);
      if (taskSection) {
        const keys = [...taskSection[1].matchAll(/[-•]\s*(\w+):/g)];
        keys.forEach(match => {
          capture.workingMemory.task[match[1]] = true;
        });
      }
      
      return; // Successfully extracted from tags
    }
    
    // Fallback: Markdown format for backwards compatibility
    const sessionSection = text.match(/Session Context[\s\S]*?\n([\s\S]*?)(?=\nTask Context|\n<|$)/);
    if (sessionSection) {
      const keys = [...sessionSection[1].matchAll(/[-•]\s*(\w+):/g)];
      keys.forEach(match => {
        capture.workingMemory.session[match[1]] = true;
      });
    }
    
    const taskSection = text.match(/Task Context[\s\S]*?\n([\s\S]*?)(?=\n<|$)/);
    if (taskSection) {
      const keys = [...taskSection[1].matchAll(/[-•]\s*(\w+):/g)];
      keys.forEach(match => {
        capture.workingMemory.task[match[1]] = true;
      });
    }
  }

  extractAnswer(text, capture) {
    // Extract JSON from <ANSWER> tags
    const answerMatch = text.match(/<ANSWER>\s*([\s\S]*?)\s*<\/ANSWER>/);
    
    if (answerMatch) {
      try {
        const jsonData = JSON.parse(answerMatch[1]);
        
        // Extract from JSON structure
        capture.answer = {
          propsDocumented: jsonData.props ? jsonData.props.map(p => p.name) : [],
          eventsDocumented: jsonData.events ? jsonData.events.map(e => e.name) : [],
          styleClassesDocumented: jsonData.styleClasses ? jsonData.styleClasses.map(s => s.name) : [],
          hasPropsTable: jsonData.props && jsonData.props.length > 0,
          hasEventsSection: jsonData.events && jsonData.events.length > 0,
          hasStyleSection: jsonData.styleClasses && jsonData.styleClasses.length > 0,
          codeExamples: jsonData.examples ? jsonData.examples.length : 0,
          sections: 5, // JSON format has fixed sections
          hasEvidenceTrail: jsonData.filesReferenced && jsonData.filesReferenced.length > 0,
          isActionable: jsonData.examples && jsonData.examples.length >= 2,
          examplesRunnable: jsonData.examples && jsonData.examples.every(ex => ex.code && ex.code.includes('<'))
        };
        
        console.log(`${colors.green}✅ Successfully parsed JSON response${colors.reset}`);
        return;
      } catch (e) {
        console.log(`${colors.yellow}⚠️  Failed to parse JSON: ${e.message}${colors.reset}`);
      }
    }
    
    // Fallback: Try to parse markdown format
    const markdownMatch = text.match(/## Final Answer[\s\S]*$/i) || 
                       text.match(/\*\*Final Answer:\*\*[\s\S]*$/i) ||
                       text.match(/## How to Use[\s\S]*$/i);
    
    if (!markdownMatch) {
      capture.answer = {
        propsDocumented: [],
        eventsDocumented: [],
        styleClassesDocumented: [],
        hasPropsTable: false,
        hasEventsSection: false,
        hasStyleSection: false,
        codeExamples: 0,
        sections: 0,
        hasEvidenceTrail: false,
        isActionable: false,
        examplesRunnable: false
      };
      return;
    }
    
    const answerText = markdownMatch[0];
    
    // Extract documented props (from markdown table - any column)
    const propsMatch = answerText.match(/\|\s*(\w+)\s*\|/g);
    const propsDocumented = propsMatch ? 
      propsMatch
        .map(m => m.match(/\|\s*(\w+)\s*\|/)[1])
        .filter(p => !['Prop', 'Type', 'Required', 'Default', 'Description', 'Property'].includes(p))
        : [];
    
    // Extract events
    const eventsMatch = answerText.match(/`?(on[A-Z]\w+)`?/g);
    const eventsDocumented = eventsMatch ? 
      eventsMatch.map(e => e.replace(/`/g, '')) : [];
    
    // Extract style classes (look for common patterns)
    const styleMatch = answerText.match(/`?(app-[a-z-]+|btn-[a-z-]+|fab-[a-z-]+|[a-z]+-[a-z-]+)`?/g);
    const styleClassesDocumented = styleMatch ?
      [...new Set(styleMatch.map(s => s.replace(/`/g, '')))] : [];
    
    // Check sections
    const hasPropsTable = /\|\s*(Property|Prop)\s*\|/.test(answerText);
    const hasEventsSection = /##\s*Events/i.test(answerText);
    const hasStyleSection = /##\s*(Styling|Style)/i.test(answerText);
    
    // Count code examples
    const codeExamples = (answerText.match(/```/g) || []).length / 2;
    
    // Count sections
    const sections = (answerText.match(/^##\s+/gm) || []).length;
    
    // Evidence trail
    const hasEvidenceTrail = /evidence|source|from/i.test(answerText);
    
    // Actionable
    const isActionable = codeExamples > 0 && hasPropsTable;
    
    capture.answer = {
      propsDocumented,
      eventsDocumented,
      styleClassesDocumented,
      hasPropsTable,
      hasEventsSection,
      hasStyleSection,
      codeExamples,
      sections,
      hasEvidenceTrail,
      isActionable,
      examplesRunnable: codeExamples > 0
    };
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
${colors.cyan}WaveMaker ReAct Agent Test Runner (OpenAI)${colors.reset}

Usage:
  node test-runner.js --test <testId>
  
Example:
  node test-runner.js --test 1.1
  
Environment Variables:
  OPENAI_API_KEY=sk-...    (required)
  
Models:
  gpt-4o            (recommended - best instruction following)
  gpt-4-turbo       (fast, excellent quality)
  gpt-3.5-turbo     (fast, budget option)
  
Documentation:
  https://platform.openai.com/docs/api-reference/chat
    `);
    process.exit(0);
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.error(`${colors.red}❌ OPENAI_API_KEY environment variable not set${colors.reset}`);
    console.log(`\nGet your API key: https://platform.openai.com/api-keys`);
    process.exit(1);
  }
  
  const testId = args[args.indexOf('--test') + 1];
  
  if (!testId) {
    console.error(`${colors.red}❌ Test ID required${colors.reset}`);
    console.log(`Usage: node test-runner.js --test 1.1`);
    process.exit(1);
  }
  
  const runner = new OpenAITestRunner();
  
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

export { OpenAITestRunner };
