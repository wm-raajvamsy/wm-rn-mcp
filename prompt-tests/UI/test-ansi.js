#!/usr/bin/env node

/**
 * Image to ANSI Converter Test Script
 * 
 * Converts UI screenshots to ANSI representations using GPT-4o
 * Usage: node test-ansi.js <image-path>
 */

import OpenAI from 'openai';
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
  dim: '\x1b[2m',
};

class ImageToANSIConverter {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Load IMAGE_TO_ANSI_PROMPT.md as system prompt
    const promptPath = path.join(__dirname, 'IMAGE_TO_ANSI_PROMPT.md');
    if (!fs.existsSync(promptPath)) {
      throw new Error(`System prompt not found: ${promptPath}`);
    }
    
    this.systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  }

  async convertToANSI(imagePath) {
    console.log(`${colors.blue}📷 Processing image: ${imagePath}${colors.reset}\n`);
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageExt = path.extname(imagePath).toLowerCase();
    
    // Determine MIME type
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[imageExt] || 'image/png';
    
    console.log(`${colors.cyan}🤖 Calling GPT-4o for ANSI generation...${colors.reset}\n`);
    
    // Call GPT-4o with vision
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: this.systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Convert this UI screenshot to ANSI representation.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.1, // Low temperature for consistency
    });
    
    const ansiOutput = response.choices[0].message.content;
    
    return ansiOutput;
  }

  saveANSI(imagePath, ansiOutput) {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'test-results', 'ansi');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate output filename based on image filename
    const imageBasename = path.basename(imagePath, path.extname(imagePath));
    const outputPath = path.join(outputDir, `${imageBasename}-ansi.txt`);
    
    // Save ANSI output
    fs.writeFileSync(outputPath, ansiOutput, 'utf-8');
    
    console.log(`${colors.green}✅ ANSI output saved to: ${outputPath}${colors.reset}\n`);
    
    return outputPath;
  }

  displayANSI(ansiOutput) {
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);
    console.log(`${colors.yellow}Generated ANSI:${colors.reset}\n`);
    console.log(ansiOutput);
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`${colors.red}❌ Error: No image path provided${colors.reset}`);
    console.log(`\nUsage: node test-ansi.js <image-path>`);
    console.log(`\nExample:`);
    console.log(`  node test-ansi.js test-cases/i1.png`);
    console.log(`  node test-ansi.js test-cases/i2.png`);
    process.exit(1);
  }
  
  const imagePath = args[0];
  
  // Resolve relative paths
  const resolvedPath = path.resolve(imagePath);
  
  try {
    const converter = new ImageToANSIConverter();
    
    // Convert image to ANSI
    const ansiOutput = await converter.convertToANSI(resolvedPath);
    
    // Display ANSI
    converter.displayANSI(ansiOutput);
    
    // Save ANSI to file
    const outputPath = converter.saveANSI(resolvedPath, ansiOutput);
    
    console.log(`${colors.green}✨ Conversion complete!${colors.reset}\n`);
    console.log(`Next step: Run ANSI to Markup conversion:`);
    console.log(`  ${colors.cyan}node test-markup.js ${outputPath} ${resolvedPath}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (error.stack) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
    process.exit(1);
  }
}

main();

