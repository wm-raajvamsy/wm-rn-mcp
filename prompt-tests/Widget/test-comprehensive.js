#!/usr/bin/env node

/**
 * Comprehensive Widget Understanding Test
 * 
 * Tests multiple widgets with challenging questions
 * Saves all Q&A to file for manual validation
 */

import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// Comprehensive test questions covering multiple widgets
const TEST_QUESTIONS = [
  // Basic counting questions
  { id: 1, question: "How many props does Accordion have?", widget: "Accordion", type: "count" },
  { id: 2, question: "How many props does Text have?", widget: "Text", type: "count" },
  { id: 3, question: "How many props does Form have?", widget: "Form", type: "count" },
  { id: 4, question: "How many props does Label have?", widget: "Label", type: "count" },
  { id: 5, question: "How many props does Checkbox have?", widget: "Checkbox", type: "count" },
  
  // Event questions
  { id: 6, question: "What events does RadioSet widget support?", widget: "RadioSet", type: "events" },
  { id: 7, question: "What events are available for Tab?", widget: "Tab", type: "events" },
  { id: 8, question: "Does Picture widget have any events?", widget: "Picture", type: "events" },
  { id: 9, question: "List all events for Checkbox widget", widget: "Checkbox", type: "events" },
  
  // Styling questions
  { id: 10, question: "How do I style the Button widget?", widget: "Button", type: "styling" },
  { id: 11, question: "What CSS classes are available for Text widget?", widget: "Text", type: "styling" },
  { id: 12, question: "How do I change the text color in Button?", widget: "Button", type: "styling-specific" },
  { id: 13, question: "Which style part does app-button-badge affect?", widget: "Button", type: "styling-mapping" },
  
  // Inheritance questions
  { id: 14, question: "Does Text widget inherit props from a parent class?", widget: "Text", type: "inheritance" },
  { id: 15, question: "What is the parent class of Text widget?", widget: "Text", type: "inheritance" },
  { id: 16, question: "How many inherited props does Text have?", widget: "Text", type: "inheritance-count" },
  
  // Comparison questions
  { id: 17, question: "Which has more props, Button or Text?", widget: "Multiple", type: "comparison" },
  { id: 18, question: "Compare the number of events between Button and Picture", widget: "Multiple", type: "comparison" },
  
  // Complex questions
  { id: 19, question: "What are the required props for Text widget?", widget: "Text", type: "required-props" },
  { id: 20, question: "What is the default value of iconposition prop in Button?", widget: "Button", type: "prop-details" },
  
  // Additional widget questions
  { id: 21, question: "How many props does Container widget have?", widget: "Container", type: "count" },
  { id: 22, question: "What events does Switch widget support?", widget: "Switch", type: "events" },
  { id: 23, question: "Does Label widget extend any parent class?", widget: "Label", type: "inheritance" },
  { id: 24, question: "What style classes are available for Picture?", widget: "Picture", type: "styling" },
  { id: 25, question: "List all props that start with 'icon' in Button widget", widget: "Button", type: "prop-filter" },
];

class ComprehensiveTest {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, 'WM_WIDGET_PROMPT.md'),
      'utf-8'
    );
    
    this.mcpClient = null;
    this.mcpTools = [];
    this.paths = {
      runtimePath: '/Users/raajr_500278/wavemaker-studio-frontend/wavemaker-rn-runtime/lib/module',
      codegenPath: '/Users/raajr_500278/wavemaker-studio-frontend/wavemaker-rn-codegen/build'
    };
    this.results = [];
  }

  async connectMCP() {
    console.log(`${colors.cyan}📡 Connecting to MCP server...${colors.reset}`);
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [path.resolve(__dirname, '../../build/index.js')]
    });
    
    this.mcpClient = new Client(
      { name: 'comprehensive-test', version: '1.0.0' },
      { capabilities: {} }
    );
    
    await this.mcpClient.connect(transport);
    
    const { tools } = await this.mcpClient.listTools();
    
    this.mcpTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || '',
        parameters: tool.inputSchema || { type: 'object', properties: {} }
      }
    }));
    
    console.log(`${colors.green}✅ Connected (${this.mcpTools.length} tools available)${colors.reset}\n`);
  }

  async askQuestion(question) {
    const conversationHistory = [
      {
        role: 'user',
        content: `I have the following paths:
runtimePath: ${this.paths.runtimePath}
codegenPath: ${this.paths.codegenPath}

Question: ${question}`
      }
    ];

    // Call OpenAI
    let response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory
      ],
      tools: this.mcpTools,
      temperature: 0
    });

    let message = response.choices[0].message;
    const toolsCalled = [];
    
    // Handle tool calls
    let iterations = 0;
    const maxIterations = 10;
    
    while (message.tool_calls && message.tool_calls.length > 0 && iterations < maxIterations) {
      iterations++;
      conversationHistory.push(message);
      
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        toolsCalled.push(functionName);
        
        try {
          const result = await this.mcpClient.callTool({
            name: functionName,
            arguments: functionArgs
          });
          
          const resultText = result.content[0]?.text || JSON.stringify(result.content);
          
          conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: resultText
          });
          
        } catch (error) {
          conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message })
          });
        }
      }
      
      response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...conversationHistory
        ],
        tools: this.mcpTools,
        temperature: 0
      });
      
      message = response.choices[0].message;
    }
    
    return {
      answer: message.content,
      toolsCalled: [...new Set(toolsCalled)]
    };
  }

  async runAllTests() {
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  Comprehensive Widget Understanding Test (25 Questions)${colors.reset}`);
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    await this.connectMCP();
    
    console.log(`${colors.yellow}Running ${TEST_QUESTIONS.length} test questions...${colors.reset}\n`);
    
    const outputLines = [];
    outputLines.push('# Comprehensive Widget Understanding Test Results');
    outputLines.push('');
    outputLines.push(`Test Date: ${new Date().toISOString()}`);
    outputLines.push(`Model: gpt-4o`);
    outputLines.push(`System Prompt: WM_WIDGET_PROMPT.md`);
    outputLines.push(`Total Questions: ${TEST_QUESTIONS.length}`);
    outputLines.push('');
    outputLines.push('═'.repeat(80));
    outputLines.push('');
    
    for (const test of TEST_QUESTIONS) {
      console.log(`${colors.blue}[${test.id}/${TEST_QUESTIONS.length}] ${test.question}${colors.reset}`);
      
      try {
        const { answer, toolsCalled } = await this.askQuestion(test.question);
        
        console.log(`${colors.green}✓ Answered${colors.reset}`);
        console.log(`${colors.dim}  Tools: ${toolsCalled.join(', ')}${colors.reset}\n`);
        
        this.results.push({
          id: test.id,
          question: test.question,
          widget: test.widget,
          type: test.type,
          answer,
          toolsCalled,
          success: true
        });
        
        // Add to output
        outputLines.push(`## Question ${test.id}: ${test.question}`);
        outputLines.push('');
        outputLines.push(`**Widget:** ${test.widget}`);
        outputLines.push(`**Type:** ${test.type}`);
        outputLines.push(`**Tools Called:** ${toolsCalled.join(', ')}`);
        outputLines.push('');
        outputLines.push(`**Answer:**`);
        outputLines.push(answer);
        outputLines.push('');
        outputLines.push('─'.repeat(80));
        outputLines.push('');
        
        // Save intermediate results
        const tempFile = path.join(__dirname, `test-results-inprogress.md`);
        fs.writeFileSync(tempFile, outputLines.join('\n'));
        
      } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}\n`);
        
        this.results.push({
          id: test.id,
          question: test.question,
          widget: test.widget,
          type: test.type,
          error: error.message,
          success: false
        });
        
        outputLines.push(`## Question ${test.id}: ${test.question}`);
        outputLines.push('');
        outputLines.push(`**ERROR:** ${error.message}`);
        outputLines.push('');
        outputLines.push('─'.repeat(80));
        outputLines.push('');
      }
    }
    
    await this.mcpClient.close();
    
    // Summary
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ Completed: ${successful}/${TEST_QUESTIONS.length} questions${colors.reset}`);
    if (failed > 0) {
      console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    }
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    // Save to file
    const timestamp = Date.now();
    const outputFile = path.join(__dirname, `test-results-${timestamp}.md`);
    
    outputLines.push('');
    outputLines.push('═'.repeat(80));
    outputLines.push('# Summary');
    outputLines.push('═'.repeat(80));
    outputLines.push('');
    outputLines.push(`Total Questions: ${TEST_QUESTIONS.length}`);
    outputLines.push(`Successful: ${successful}`);
    outputLines.push(`Failed: ${failed}`);
    outputLines.push('');
    
    // Group by question type
    const byType = {};
    this.results.forEach(r => {
      if (!byType[r.type]) byType[r.type] = [];
      byType[r.type].push(r);
    });
    
    outputLines.push('## By Question Type:');
    outputLines.push('');
    Object.entries(byType).forEach(([type, results]) => {
      const success = results.filter(r => r.success).length;
      outputLines.push(`- ${type}: ${success}/${results.length} succeeded`);
    });
    
    fs.writeFileSync(outputFile, outputLines.join('\n'));
    
    console.log(`${colors.green}📄 Results saved to: ${outputFile}${colors.reset}`);
    console.log(`${colors.yellow}Please review the file and validate answers manually.${colors.reset}\n`);
  }
}

// Main
async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(`${colors.red}❌ OPENAI_API_KEY not set${colors.reset}`);
    process.exit(1);
  }
  
  const test = new ComprehensiveTest();
  await test.runAllTests();
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});

