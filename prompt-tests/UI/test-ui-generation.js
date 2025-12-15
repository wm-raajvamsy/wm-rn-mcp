#!/usr/bin/env node

/**
 * UI Generation Test Runner
 * 
 * Tests UI generation from screenshots
 * Validates generated markup
 * Tracks results for prompt refinement
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
  dim: '\x1b[2m',
};

// Test cases - user will provide images
const TEST_CASES = [
  {
    id: 1,
    name: "Simple Login Form",
    image: "test-cases/simple-login.png",
    description: "Basic form with 2 inputs and button",
    expectedComponents: ["wm-form", "wm-form-field", "wm-button"],
    complexity: "simple"
  },
  {
    id: 2,
    name: "Product Card",
    image: "test-cases/product-card.png",
    description: "Card with image, title, price, button",
    expectedComponents: ["wm-container", "wm-picture", "wm-label", "wm-button"],
    complexity: "simple"
  },
  {
    id: 3,
    name: "Form with Validation",
    image: "test-cases/form-with-validation.png",
    description: "Form with multiple field types and validation",
    expectedComponents: ["wm-form", "wm-form-field"],
    complexity: "medium"
  },
  {
    id: 4,
    name: "List View",
    image: "test-cases/list-view.png",
    description: "Vertical list of repeating items",
    expectedComponents: ["wm-list", "wm-listtemplate"],
    complexity: "medium"
  },
  {
    id: 5,
    name: "Dashboard",
    image: "test-cases/dashboard.png",
    description: "Complex layout with multiple sections",
    expectedComponents: ["wm-container", "wm-linearlayout"],
    complexity: "complex"
  }
];

class UIGenerationTest {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, 'WM_UI_PROMPT.md'),
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
      { name: 'ui-generation-test', version: '1.0.0' },
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

  async generateUI(testCase) {
    const imagePath = path.join(__dirname, testCase.image);
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    const conversationHistory = [
      {
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
      temperature: 0,
      max_tokens: 4096
    });

    let message = response.choices[0].message;
    const toolsCalled = [];
    
    // Handle tool calls
    let iterations = 0;
    const maxIterations = 20;
    
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
        temperature: 0,
        max_tokens: 4096
      });
      
      message = response.choices[0].message;
    }
    
    return {
      markup: message.content,
      toolsCalled: [...new Set(toolsCalled)],
      iterations
    };
  }

  async runAllTests() {
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  UI Generation Test Suite (${TEST_CASES.length} Test Cases)${colors.reset}`);
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    await this.connectMCP();
    
    // Create output directories
    const resultsDir = path.join(__dirname, 'test-results');
    const markupDir = path.join(resultsDir, 'generated-markup');
    const screenshotsDir = path.join(resultsDir, 'screenshots');
    
    [resultsDir, markupDir, screenshotsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log(`${colors.yellow}Running ${TEST_CASES.length} test cases...${colors.reset}\n`);
    
    const outputLines = [];
    outputLines.push('# UI Generation Test Results');
    outputLines.push('');
    outputLines.push(`Test Date: ${new Date().toISOString()}`);
    outputLines.push(`Model: gpt-4o`);
    outputLines.push(`System Prompt: WM_UI_PROMPT.md (Minimal v1)`);
    outputLines.push(`Total Test Cases: ${TEST_CASES.length}`);
    outputLines.push('');
    outputLines.push('═'.repeat(80));
    outputLines.push('');
    
    for (const testCase of TEST_CASES) {
      console.log(`${colors.blue}[${testCase.id}/${TEST_CASES.length}] ${testCase.name}${colors.reset}`);
      console.log(`${colors.dim}  ${testCase.description}${colors.reset}`);
      
      // Check if image exists
      const imagePath = path.join(__dirname, testCase.image);
      if (!fs.existsSync(imagePath)) {
        console.log(`${colors.yellow}  ⚠ Image not found: ${testCase.image}${colors.reset}`);
        console.log(`${colors.dim}  Skipping...${colors.reset}\n`);
        
        this.results.push({
          id: testCase.id,
          name: testCase.name,
          skipped: true,
          reason: 'Image not found'
        });
        
        outputLines.push(`## Test ${testCase.id}: ${testCase.name} [SKIPPED]`);
        outputLines.push('');
        outputLines.push(`**Reason:** Image not found: ${testCase.image}`);
        outputLines.push('');
        outputLines.push('─'.repeat(80));
        outputLines.push('');
        continue;
      }
      
      try {
        const { markup, toolsCalled, iterations } = await this.generateUI(testCase);
        
        console.log(`${colors.green}  ✓ Generated markup${colors.reset}`);
        console.log(`${colors.dim}    Tools: ${toolsCalled.join(', ')}${colors.reset}`);
        console.log(`${colors.dim}    Iterations: ${iterations}${colors.reset}`);
        
        // Save markup
        const markupFilename = `test-${testCase.id}-${testCase.name.toLowerCase().replace(/\s+/g, '-')}.xml`;
        const markupPath = path.join(markupDir, markupFilename);
        
        // Extract XML from markdown code blocks if present
        let cleanMarkup = markup;
        const xmlMatch = markup.match(/```xml\n([\s\S]*?)\n```/);
        if (xmlMatch) {
          cleanMarkup = xmlMatch[1];
        }
        
        fs.writeFileSync(markupPath, cleanMarkup);
        console.log(`${colors.dim}    Saved: ${markupFilename}${colors.reset}`);
        
        // Validate markup
        console.log(`${colors.dim}    Validating...${colors.reset}`);
        const validator = new MarkupValidator(markupPath);
        validator.validate();
        const validationStatus = validator.generateReport();
        
        const reportPath = markupPath.replace(/\.xml$/, '-validation.md');
        validator.saveReport(reportPath);
        
        const validationSummary = {
          critical: validator.results.critical.length,
          warning: validator.results.warning.length,
          info: validator.results.info.length,
          passed: validator.results.passed.length
        };
        
        this.results.push({
          id: testCase.id,
          name: testCase.name,
          description: testCase.description,
          complexity: testCase.complexity,
          markup: cleanMarkup,
          markupPath,
          toolsCalled,
          iterations,
          validation: validationSummary,
          validationStatus,
          success: true
        });
        
        // Add to output
        outputLines.push(`## Test ${testCase.id}: ${testCase.name}`);
        outputLines.push('');
        outputLines.push(`**Description:** ${testCase.description}`);
        outputLines.push(`**Complexity:** ${testCase.complexity}`);
        outputLines.push(`**Tools Called:** ${toolsCalled.join(', ')}`);
        outputLines.push(`**Iterations:** ${iterations}`);
        outputLines.push('');
        outputLines.push(`**Validation Results:**`);
        outputLines.push(`- Status: ${validationStatus}`);
        outputLines.push(`- Critical: ${validationSummary.critical}`);
        outputLines.push(`- Warnings: ${validationSummary.warning}`);
        outputLines.push(`- Info: ${validationSummary.info}`);
        outputLines.push(`- Passed: ${validationSummary.passed}`);
        outputLines.push('');
        outputLines.push(`**Files:**`);
        outputLines.push(`- Markup: \`${markupFilename}\``);
        outputLines.push(`- Validation Report: \`${path.basename(reportPath)}\``);
        outputLines.push('');
        outputLines.push(`**Next Steps:**`);
        outputLines.push(`1. Render the markup in WaveMaker`);
        outputLines.push(`2. Take a screenshot`);
        outputLines.push(`3. Save to: \`test-results/screenshots/${markupFilename.replace('.xml', '.png')}\``);
        outputLines.push(`4. Compare with reference image: \`${testCase.image}\``);
        outputLines.push('');
        outputLines.push('─'.repeat(80));
        outputLines.push('');
        
        console.log('');
        
      } catch (error) {
        console.log(`${colors.red}  ✗ Error: ${error.message}${colors.reset}\n`);
        
        this.results.push({
          id: testCase.id,
          name: testCase.name,
          error: error.message,
          success: false
        });
        
        outputLines.push(`## Test ${testCase.id}: ${testCase.name} [ERROR]`);
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
    const skipped = this.results.filter(r => r.skipped).length;
    const failed = this.results.filter(r => !r.success && !r.skipped).length;
    
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ Completed: ${successful}/${TEST_CASES.length} tests${colors.reset}`);
    if (skipped > 0) {
      console.log(`${colors.yellow}⚠ Skipped: ${skipped}${colors.reset}`);
    }
    if (failed > 0) {
      console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    }
    console.log(`${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    // Save to file
    const timestamp = Date.now();
    const outputFile = path.join(resultsDir, `test-results-${timestamp}.md`);
    
    outputLines.push('');
    outputLines.push('═'.repeat(80));
    outputLines.push('# Summary');
    outputLines.push('═'.repeat(80));
    outputLines.push('');
    outputLines.push(`Total Test Cases: ${TEST_CASES.length}`);
    outputLines.push(`Successful: ${successful}`);
    outputLines.push(`Skipped: ${skipped}`);
    outputLines.push(`Failed: ${failed}`);
    outputLines.push('');
    
    // Validation summary
    const validationStats = {
      allPassed: 0,
      passedWithWarnings: 0,
      failed: 0
    };
    
    this.results.filter(r => r.success).forEach(r => {
      if (r.validationStatus === 'pass') validationStats.allPassed++;
      else if (r.validationStatus === 'pass-with-warnings') validationStats.passedWithWarnings++;
      else validationStats.failed++;
    });
    
    outputLines.push('## Validation Summary:');
    outputLines.push('');
    outputLines.push(`- All Passed: ${validationStats.allPassed}`);
    outputLines.push(`- Passed with Warnings: ${validationStats.passedWithWarnings}`);
    outputLines.push(`- Failed: ${validationStats.failed}`);
    outputLines.push('');
    
    outputLines.push('## Next Steps:');
    outputLines.push('');
    outputLines.push('1. Review validation reports for each test');
    outputLines.push('2. Render markup in WaveMaker and take screenshots');
    outputLines.push('3. Compare screenshots with reference images');
    outputLines.push('4. Identify common failure patterns');
    outputLines.push('5. Update WM_UI_PROMPT.md to address issues');
    outputLines.push('6. Re-run tests');
    outputLines.push('');
    
    fs.writeFileSync(outputFile, outputLines.join('\n'));
    
    console.log(`${colors.green}📄 Results saved to: ${outputFile}${colors.reset}`);
    console.log(`${colors.yellow}Please review validation reports and render markup for visual comparison.${colors.reset}\n`);
  }
}

// Main
async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(`${colors.red}❌ OPENAI_API_KEY not set${colors.reset}`);
    process.exit(1);
  }
  
  const test = new UIGenerationTest();
  await test.runAllTests();
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});

