#!/usr/bin/env node

/**
 * Simple CLI Chat for Widget Understanding
 * 
 * Uses WM_WIDGET_PROMPT.md as system prompt
 * Connects to MCP server for tools
 * Manual Q&A for testing widget understanding
 */

import readline from 'readline';
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
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

class WidgetChat {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Load system prompt (one directory up)
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, '../WM_WIDGET_PROMPT.md'),
      'utf-8'
    );
    
    this.mcpClient = null;
    this.conversationHistory = [];
    this.mcpTools = [];
  }

  async connectMCP() {
    console.log(`${colors.blue}📡 Connecting to MCP server...${colors.reset}`);
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [path.resolve(__dirname, '../build/index.js')]
    });
    
    this.mcpClient = new Client(
      { name: 'widget-chat', version: '1.0.0' },
      { capabilities: {} }
    );
    
    await this.mcpClient.connect(transport);
    
    // Get available tools
    const { tools } = await this.mcpClient.listTools();
    
    // Format for OpenAI
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

  async chat(userMessage) {
    // Add user message
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Call OpenAI
    let response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory
      ],
      tools: this.mcpTools,
      temperature: 0
    });

    let message = response.choices[0].message;
    
    // Handle tool calls
    while (message.tool_calls && message.tool_calls.length > 0) {
      // Add assistant message with tool calls
      this.conversationHistory.push(message);
      
      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`${colors.dim}  → Calling ${functionName}...${colors.reset}`);
        
        try {
          const result = await this.mcpClient.callTool({
            name: functionName,
            arguments: functionArgs
          });
          
          const resultText = result.content[0]?.text || JSON.stringify(result.content);
          
          // Add tool result
          this.conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: resultText
          });
          
        } catch (error) {
          console.log(`${colors.red}  ✗ Tool error: ${error.message}${colors.reset}`);
          this.conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message })
          });
        }
      }
      
      // Get next response
      response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory
        ],
        tools: this.mcpTools,
        temperature: 0
      });
      
      message = response.choices[0].message;
    }
    
    // Add final assistant message
    this.conversationHistory.push(message);
    
    return message.content;
  }

  async start() {
    console.clear();
    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║        WaveMaker Widget Understanding Chat                 ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    // Connect to MCP
    await this.connectMCP();
    
    console.log(`${colors.yellow}Instructions:${colors.reset}`);
    console.log(`  • Ask any question about widgets (Button, Text, Picture, etc.)`);
    console.log(`  • Type 'clear' to reset conversation`);
    console.log(`  • Type 'quit' or 'exit' to end\n`);
    
    console.log(`${colors.yellow}Example questions:${colors.reset}`);
    console.log(`  • "How many props does Button have?"`);
    console.log(`  • "What events does Text widget support?"`);
    console.log(`  • "How do I style the Button widget?"`);
    console.log(`  • "Tell me about the Picture widget"\n`);
    
    console.log(`${colors.blue}Ready! You can start asking questions.${colors.reset}\n`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.magenta}You: ${colors.reset}`
    });
    
    rl.prompt();
    
    rl.on('line', async (line) => {
      const input = line.trim();
      
      // Handle commands
      if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        console.log(`\n${colors.cyan}👋 Goodbye!${colors.reset}\n`);
        rl.close();
        await this.mcpClient.close();
        process.exit(0);
      }
      
      if (input.toLowerCase() === 'clear') {
        console.clear();
        this.conversationHistory = [];
        console.log(`${colors.green}✅ Conversation cleared${colors.reset}\n`);
        rl.prompt();
        return;
      }
      
      if (!input) {
        rl.prompt();
        return;
      }
      
      // Process question
      console.log('');
      
      try {
        const answer = await this.chat(input);
        
        console.log(`${colors.green}Agent:${colors.reset}`);
        console.log(answer);
        console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
        
      } catch (error) {
        console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      }
      
      rl.prompt();
    });
    
    rl.on('close', async () => {
      console.log(`\n${colors.cyan}Session ended.${colors.reset}`);
      if (this.mcpClient) {
        await this.mcpClient.close();
      }
      process.exit(0);
    });
  }
}

// Main
async function main() {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error(`${colors.red}❌ OPENAI_API_KEY environment variable not set${colors.reset}`);
    console.log(`\nSet it with:`);
    console.log(`  export OPENAI_API_KEY=your-key-here\n`);
    process.exit(1);
  }
  
  const chat = new WidgetChat();
  await chat.start();
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});

