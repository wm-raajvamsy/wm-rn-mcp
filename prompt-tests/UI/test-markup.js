#!/usr/bin/env node

/**
 * ANSI to Markup Converter Test Script
 * 
 * Converts ANSI representations to WaveMaker markup using GPT-4o + MCP tools
 * Usage: node test-markup.js <ansi-file-path> [image-path]
 */

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

class ANSIToMarkupConverter {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Load ANSI_TO_MARKUP_PROMPT.md as system prompt
    const promptPath = path.join(__dirname, 'ANSI_TO_MARKUP_PROMPT.md');
    if (!fs.existsSync(promptPath)) {
      throw new Error(`System prompt not found: ${promptPath}`);
    }
    
    this.systemPrompt = fs.readFileSync(promptPath, 'utf-8');
    
    this.mcpClient = null;
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
      { name: 'ansi-to-markup-converter', version: '1.0.0' },
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
    
    console.log(`${colors.green}✅ Connected (${this.mcpTools.length} MCP tools available)${colors.reset}\n`);
  }

  async convertToMarkup(ansiPath, imagePath = null) {
    console.log(`${colors.blue}📄 Processing ANSI: ${ansiPath}${colors.reset}`);
    if (imagePath) {
      console.log(`${colors.blue}📷 With reference image: ${imagePath}${colors.reset}\n`);
    }
    
    // Check if ANSI file exists
    if (!fs.existsSync(ansiPath)) {
      throw new Error(`ANSI file not found: ${ansiPath}`);
    }
    
    // Read ANSI content
    const ansiContent = fs.readFileSync(ansiPath, 'utf-8');
    
    // Prepare user message content
    const userMessageContent = [
      {
        type: 'text',
        text: `I have the following paths for MCP tools:
runtimePath: ${this.paths.runtimePath}
codegenPath: ${this.paths.codegenPath}

Here is the ANSI representation to convert to WaveMaker markup:

\`\`\`
${ansiContent}
\`\`\`

Please convert this ANSI to valid WaveMaker markup using MCP tools.`
      }
    ];
    
    // Add image if provided
    if (imagePath && fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      const imageExt = path.extname(imagePath).toLowerCase();
      
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const mimeType = mimeTypes[imageExt] || 'image/png';
      
      userMessageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${imageBase64}`
        }
      });
    }
    
    console.log(`${colors.cyan}🤖 Calling GPT-4o for markup generation (with MCP tools)...${colors.reset}\n`);
    
    let conversationHistory = [
      {
        role: 'system',
        content: this.systemPrompt
      },
      {
        role: 'user',
        content: userMessageContent
      }
    ];
    
    let markup = null;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops
    
    while (!markup && iterations < maxIterations) {
      iterations++;
      
      // Call GPT-4o with tools
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: conversationHistory,
        tools: this.mcpTools,
        tool_choice: 'auto',
        max_tokens: 4096,
        temperature: 0.1, // Low temperature for consistency
      });
      
      const message = response.choices[0].message;
      conversationHistory.push(message);
      
      // Check if there are tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`${colors.magenta}🔧 Executing ${message.tool_calls.length} tool call(s)...${colors.reset}`);
        
        // Execute tool calls via MCP
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          console.log(`${colors.dim}  → ${toolName}(${JSON.stringify(toolArgs).substring(0, 60)}...)${colors.reset}`);
          
          try {
            // Call MCP tool
            const result = await this.mcpClient.callTool({
              name: toolName,
              arguments: toolArgs
            });
            
            // Add tool result to conversation
            conversationHistory.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result.content)
            });
          } catch (error) {
            console.error(`${colors.red}    ✗ Tool call failed: ${error.message}${colors.reset}`);
            conversationHistory.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: error.message })
            });
          }
        }
      } else {
        // No more tool calls, this should be the final markup
        markup = message.content;
      }
    }
    
    if (!markup) {
      throw new Error('Failed to generate markup after maximum iterations');
    }
    
    return markup;
  }

  extractMarkupFromResponse(response) {
    // Try to extract XML from markdown code blocks
    const xmlMatch = response.match(/```xml\n([\s\S]*?)\n```/);
    if (xmlMatch) {
      return xmlMatch[1].trim();
    }
    
    // Try to extract <wm-page> content directly
    const wmPageMatch = response.match(/(<wm-page[\s\S]*<\/wm-page>)/);
    if (wmPageMatch) {
      return wmPageMatch[1].trim();
    }
    
    // Return as-is if no extraction possible
    return response.trim();
  }

  saveMarkup(ansiPath, markupResponse) {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'test-results', 'markup');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate output filename based on ANSI filename
    const ansiBasename = path.basename(ansiPath, path.extname(ansiPath));
    const cleanBasename = ansiBasename.replace('-ansi', ''); // Remove -ansi suffix if present
    const timestamp = Date.now();
    const outputPath = path.join(outputDir, `${cleanBasename}-${timestamp}.xml`);
    
    // Extract XML from response
    const markup = this.extractMarkupFromResponse(markupResponse);
    
    // Save markup
    fs.writeFileSync(outputPath, markup, 'utf-8');
    
    console.log(`${colors.green}✅ Markup saved to: ${outputPath}${colors.reset}\n`);
    
    return outputPath;
  }

  async validateMarkup(markupPath) {
    console.log(`${colors.cyan}🔍 Validating markup...${colors.reset}\n`);
    
    try {
      const validator = new MarkupValidator();
      const result = await validator.validateFile(markupPath);
      
      // Display results (validator already prints to console)
      
      return result;
    } catch (error) {
      console.error(`${colors.red}❌ Validation error: ${error.message}${colors.reset}`);
      return { passed: false, errors: [error.message] };
    }
  }

  async cleanup() {
    if (this.mcpClient) {
      await this.mcpClient.close();
    }
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`${colors.red}❌ Error: No ANSI file path provided${colors.reset}`);
    console.log(`\nUsage: node test-markup.js <ansi-file-path> [image-path]`);
    console.log(`\nExamples:`);
    console.log(`  node test-markup.js test-results/ansi/i1-ansi.txt`);
    console.log(`  node test-markup.js test-results/ansi/i2-ansi.txt test-cases/i2.png`);
    process.exit(1);
  }
  
  const ansiPath = args[0];
  const imagePath = args[1] || null;
  
  // Resolve relative paths
  const resolvedAnsiPath = path.resolve(ansiPath);
  const resolvedImagePath = imagePath ? path.resolve(imagePath) : null;
  
  const converter = new ANSIToMarkupConverter();
  
  try {
    // Connect to MCP server
    await converter.connectMCP();
    
    // Convert ANSI to markup
    const markupResponse = await converter.convertToMarkup(resolvedAnsiPath, resolvedImagePath);
    
    // Save markup to file
    const outputPath = converter.saveMarkup(resolvedAnsiPath, markupResponse);
    
    // Validate markup
    const validationResult = await converter.validateMarkup(outputPath);
    
    if (validationResult.passed) {
      console.log(`${colors.green}✨ Conversion complete with valid markup!${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠️  Conversion complete but with validation errors${colors.reset}\n`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (error.stack) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
    process.exit(1);
  } finally {
    await converter.cleanup();
  }
}

main();

