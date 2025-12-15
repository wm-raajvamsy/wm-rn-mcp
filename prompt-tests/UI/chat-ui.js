#!/usr/bin/env node

/**
 * Interactive UI Generation Chat
 * 
 * Uses WM_UI_PROMPT.md as system prompt
 * Connects to MCP server for widget tools
 * Generates UI from screenshot images
 */

import readline from 'readline';
import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MarkupValidator } from './validate-markup.js';

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

class UIGenerationChat {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, 'WM_UI_PROMPT.md'),
      'utf-8'
    );
    
    this.mcpClient = null;
    this.conversationHistory = [];
    this.mcpTools = [];
    this.paths = {
      runtimePath: '/Users/raajr_500278/D13/generated-rn-app/node_modules/@wavemaker/app-rn-runtime',
      codegenPath: '/Users/raajr_500278/D13/generated-rn-app/node_modules/@wavemaker/rn-codegen'
    };
  }

  async connectMCP() {
    console.log(`${colors.blue}📡 Connecting to MCP server...${colors.reset}`);
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [path.resolve(__dirname, '../../build/index.js')]
    });
    
    this.mcpClient = new Client(
      { name: 'ui-generation-chat', version: '1.0.0' },
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

  async generateUI(imagePath) {
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Add user message with image
    this.conversationHistory.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `I have the following paths:
runtimePath: ${this.paths.runtimePath}
codegenPath: ${this.paths.codegenPath}

Generate WaveMaker UI markup for this screenshot.`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${imageBase64}`
          }
        }
      ]
    });

    // Call OpenAI
    let response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory
      ],
      tools: this.mcpTools,
      temperature: 0,
      max_tokens: 4096
    });

    let message = response.choices[0].message;
    
    // Handle tool calls
    let iterations = 0;
    const maxIterations = 20;
    
    while (message.tool_calls && message.tool_calls.length > 0 && iterations < maxIterations) {
      iterations++;
      this.conversationHistory.push(message);
      
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
      
      response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory
        ],
        tools: this.mcpTools,
        temperature: 0,
        max_tokens: 4096
      });
      
      message = response.choices[0].message;
    }
    
    this.conversationHistory.push(message);
    
    return message.content;
  }

  async start() {
    console.clear();
    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║        WaveMaker UI Generation Chat                       ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    await this.connectMCP();
    
    console.log(`${colors.yellow}Instructions:${colors.reset}`);
    console.log(`  • Provide path to UI screenshot image`);
    console.log(`  • Agent will generate WaveMaker markup`);
    console.log(`  • Markup will be validated automatically`);
    console.log(`  • Type 'clear' to reset conversation`);
    console.log(`  • Type 'quit' or 'exit' to end\n`);
    
    console.log(`${colors.yellow}Example:${colors.reset}`);
    console.log(`  You: ./test-cases/simple-login.png`);
    console.log(`  Agent: [generates markup]\n`);
    
    console.log(`${colors.blue}Ready! Provide an image path.${colors.reset}\n`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.magenta}Image path: ${colors.reset}`
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
      
      // Process image path
      console.log('');
      
      try {
        // Resolve path
        const imagePath = path.resolve(input);
        
        console.log(`${colors.blue}Generating UI from: ${imagePath}${colors.reset}\n`);
        
        const markup = await this.generateUI(imagePath);
        
        console.log(`${colors.green}Agent:${colors.reset}`);
        console.log(markup);
        console.log('');
        
        // Extract XML from markdown code blocks if present
        let cleanMarkup = markup;
        const xmlMatch = markup.match(/```xml\n([\s\S]*?)\n```/);
        if (xmlMatch) {
          cleanMarkup = xmlMatch[1];
        }
        
        // Save markup
        const timestamp = Date.now();
        const outputDir = path.join(__dirname, 'test-results', 'generated-markup');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputFile = path.join(outputDir, `chat-generated-${timestamp}.xml`);
        fs.writeFileSync(outputFile, cleanMarkup);
        
        console.log(`${colors.green}💾 Saved to: ${outputFile}${colors.reset}\n`);
        
        // Validate
        console.log(`${colors.blue}Validating markup...${colors.reset}\n`);
        const validator = new MarkupValidator(outputFile);
        validator.validate();
        const status = validator.generateReport();
        
        const reportPath = outputFile.replace(/\.xml$/, '-validation.md');
        validator.saveReport(reportPath);
        
        console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
        
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
  if (!process.env.OPENAI_API_KEY) {
    console.error(`${colors.red}❌ OPENAI_API_KEY environment variable not set${colors.reset}`);
    console.log(`\nSet it with:`);
    console.log(`  export OPENAI_API_KEY=your-key-here\n`);
    process.exit(1);
  }
  
  const chat = new UIGenerationChat();
  await chat.start();
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});

