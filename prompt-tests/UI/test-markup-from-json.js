import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  fg: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  }
};

class JSONToMarkupConverter {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, 'JSON_TO_MARKUP_PROMPT.md'),
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
    console.log(`${colors.fg.cyan}🔌 Connecting to MCP server...${colors.reset}\n`);
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['/Users/raajr_500278/ai/wavemaker-rn-mcp/build/index.js'],
      env: {
        ...process.env,
        RUNTIME_PATH: this.paths.runtimePath,
        CODEGEN_PATH: this.paths.codegenPath,
      },
    });

    this.mcpClient = new Client({
      name: 'json-to-markup-converter',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await this.mcpClient.connect(transport);
    
    // Get available tools
    const toolsResponse = await this.mcpClient.listTools();
    
    // Convert MCP tools to OpenAI format
    this.mcpTools = toolsResponse.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
    
    console.log(`${colors.fg.green}✅ Connected! Available tools: ${toolsResponse.tools.length}${colors.reset}\n`);
  }

  async callMCPTool(toolName, args) {
    console.log(`${colors.fg.magenta}🔧 Calling MCP tool: ${toolName}${colors.reset}`);
    console.log(`${colors.dim}   Args: ${JSON.stringify(args)}${colors.reset}\n`);
    
    const result = await this.mcpClient.callTool({
      name: toolName,
      arguments: args,
    });
    
    return result.content[0].text;
  }

  async convertJSONToMarkup(jsonPath, imagePath) {
    console.log(`${colors.fg.blue}📄 Processing JSON: ${jsonPath}${colors.reset}`);
    console.log(`${colors.fg.blue}🖼️  Reference image: ${imagePath}${colors.reset}\n`);

    // Read JSON
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    
    // Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    // Initial user message
    this.conversationHistory.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Convert this JSON UI structure to WaveMaker markup. Use the image for visual styling reference.

JSON Structure:
${jsonContent}

Paths available:
- runtimePath: ${this.paths.runtimePath}
- codegenPath: ${this.paths.codegenPath}

First, call MCP tools to discover widget properties, then generate the markup.`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
      ],
    });

    console.log(`${colors.fg.cyan}🤖 Calling GPT-4o for markup generation...${colors.reset}\n`);

    let finalMarkup = null;
    let iterationCount = 0;
    const maxIterations = 10;

    while (iterationCount < maxIterations && !finalMarkup) {
      iterationCount++;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          ...this.conversationHistory,
        ],
        tools: this.mcpTools,
        tool_choice: 'auto',
        max_tokens: 4000,
        temperature: 0.1,
      });

      const assistantMessage = response.choices[0].message;
      this.conversationHistory.push(assistantMessage);

      // Check if tool calls were made
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`${colors.fg.yellow}🔄 Processing ${assistantMessage.tool_calls.length} tool call(s)...${colors.reset}\n`);
        
        // Execute all tool calls
        const toolResults = [];
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          const toolResult = await this.callMCPTool(toolName, toolArgs);
          
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
        
        // Add tool results to conversation
        this.conversationHistory.push(...toolResults);
        
      } else {
        // No more tool calls, this should be the final markup
        finalMarkup = assistantMessage.content;
        break;
      }
    }

    if (!finalMarkup) {
      throw new Error('Failed to generate markup after maximum iterations');
    }

    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);
    console.log(`${colors.fg.yellow}Generated Markup:${colors.reset}\n`);
    console.log(finalMarkup);
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);

    // Save markup
    const jsonName = path.basename(jsonPath, path.extname(jsonPath));
    const baseName = jsonName.replace('-clean', '').replace('.json', '');
    const outputDir = path.join(__dirname, 'test-results', 'markup');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${baseName}.xml`);
    
    // Extract XML from markdown code blocks if present
    let xmlContent = finalMarkup;
    const xmlMatch = finalMarkup.match(/```xml\s*([\s\S]*?)\s*```/);
    if (xmlMatch) {
      xmlContent = xmlMatch[1];
    }
    
    fs.writeFileSync(outputPath, xmlContent);

    console.log(`${colors.fg.green}✅ Markup saved to: ${outputPath}${colors.reset}\n`);

    // Validate markup
    await this.validateMarkup(xmlContent);

    return { markup: xmlContent, outputPath };
  }

  async validateMarkup(markup) {
    console.log(`${colors.fg.cyan}🔍 Validating markup...${colors.reset}\n`);
    
    const issues = [];
    
    // Check for wm-page-content wrapper
    if (!markup.includes('<wm-page-content>')) {
      issues.push('Missing <wm-page-content> wrapper');
    }
    
    // Check for screen_root
    if (!markup.includes('name="screen_root"')) {
      issues.push('Missing screen_root container');
    }
    
    // Check screen_root has fill dimensions
    const screenRootMatch = markup.match(/<wm-container[^>]*name="screen_root"[^>]*>/);
    if (screenRootMatch) {
      const screenRootTag = screenRootMatch[0];
      if (!screenRootTag.includes('width="fill"')) {
        issues.push('Screen root missing width="fill"');
      }
      if (!screenRootTag.includes('height="fill"')) {
        issues.push('Screen root missing height="fill"');
      }
    }
    
    // Check for required container attributes
    const containerMatches = markup.matchAll(/<wm-container([^>]*)>/g);
    for (const match of containerMatches) {
      const attrs = match[1];
      const requiredAttrs = ['name=', 'direction=', 'gap=', 'alignment=', 'width=', 'height='];
      const missingAttrs = requiredAttrs.filter(attr => !attrs.includes(attr));
      if (missingAttrs.length > 0) {
        issues.push(`Container missing attributes: ${missingAttrs.join(', ')}`);
      }
    }
    
    // Check for basic XML validity
    const openTags = (markup.match(/<wm-\w+[^/]*>/g) || []).length;
    const closeTags = (markup.match(/<\/wm-\w+>/g) || []).length;
    const selfClosing = (markup.match(/<wm-\w+[^>]*\/>/g) || []).length;
    
    if (openTags !== closeTags + selfClosing) {
      issues.push(`Mismatched tags: ${openTags} open, ${closeTags} close, ${selfClosing} self-closing`);
    }
    
    if (issues.length === 0) {
      console.log(`${colors.fg.green}✅ Markup validation passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.fg.red}❌ Markup validation issues:${colors.reset}`);
      issues.forEach(issue => console.log(`${colors.fg.red}   - ${issue}${colors.reset}`));
      console.log();
    }
    
    return issues;
  }

  async cleanup() {
    if (this.mcpClient) {
      await this.mcpClient.close();
    }
  }
}

async function main() {
  if (process.argv.length < 4) {
    console.log('Usage: node test-markup-from-json.js <json-path> <image-path>');
    console.log('Example: node test-markup-from-json.js test-results/json/i1-clean.json test-cases/i1.png');
    process.exit(1);
  }

  const jsonPath = process.argv[2];
  const imagePath = process.argv[3];

  if (!fs.existsSync(jsonPath)) {
    console.error(`${colors.fg.red}Error: JSON file not found: ${jsonPath}${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`${colors.fg.red}Error: Image file not found: ${imagePath}${colors.reset}`);
    process.exit(1);
  }

  const converter = new JSONToMarkupConverter();
  
  try {
    await converter.connectMCP();
    await converter.convertJSONToMarkup(jsonPath, imagePath);
    
    console.log(`${colors.fg.green}✨ Conversion complete!${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.fg.red}Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await converter.cleanup();
  }
}

main();

