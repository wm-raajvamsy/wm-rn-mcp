import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
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

class ImageToJSONConverter {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Load the JSON-based prompt
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, 'IMAGE_TO_JSON_PROMPT.md'),
      'utf-8'
    );
    
    this.conversationHistory = [];
  }

  async generateJSON(imagePath) {
    console.log(`${colors.fg.blue}📷 Processing image: ${imagePath}${colors.reset}\n`);

    // Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    // Add user message with image
    this.conversationHistory.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Analyze this UI screenshot and generate the JSON structure. Ensure the outermost container is named 'screen_root' and has width="fill" height="fill".`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
      ],
    });

    console.log(`${colors.fg.cyan}🤖 Calling GPT-4o for JSON generation...${colors.reset}\n`);

    // Call OpenAI API
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        ...this.conversationHistory,
      ],
      max_tokens: 4000,
      temperature: 0.1, // Low temperature for consistent output
    });

    const jsonOutput = response.choices[0].message.content;
    
    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: jsonOutput,
    });

    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);
    console.log(`${colors.fg.yellow}Generated JSON:${colors.reset}\n`);
    console.log(jsonOutput);
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}\n`);

    // Save JSON output
    const imageName = path.basename(imagePath, path.extname(imagePath));
    const outputDir = path.join(__dirname, 'test-results', 'json');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${imageName}.json`);
    fs.writeFileSync(outputPath, jsonOutput);

    console.log(`${colors.fg.green}✅ JSON output saved to: ${outputPath}${colors.reset}\n`);

    return { jsonOutput, outputPath };
  }

  async validateJSON(jsonOutput) {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonStr = jsonOutput;
      const jsonMatch = jsonOutput.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Try to find JSON object
        const startIdx = jsonOutput.indexOf('{');
        const endIdx = jsonOutput.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          jsonStr = jsonOutput.substring(startIdx, endIdx + 1);
        }
      }

      const parsed = JSON.parse(jsonStr);
      
      // Validate screen_root
      if (!parsed.screen_root) {
        return { valid: false, error: 'Missing screen_root' };
      }
      
      const root = parsed.screen_root;
      if (root.width !== 'fill' || root.height !== 'fill') {
        return { valid: false, error: `Screen root has wrong dimensions: width="${root.width}" height="${root.height}"` };
      }
      
      // Check required properties
      const required = ['type', 'name', 'direction', 'gap', 'alignment', 'width', 'height', 'children'];
      const missing = required.filter(prop => !(prop in root));
      if (missing.length > 0) {
        return { valid: false, error: `Screen root missing properties: ${missing.join(', ')}` };
      }
      
      return { valid: true, parsed, jsonStr };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node test-json.js <image-path>');
    console.log('Example: node test-json.js test-cases/i1.png');
    process.exit(1);
  }

  const imagePath = process.argv[2];

  if (!fs.existsSync(imagePath)) {
    console.error(`${colors.fg.red}Error: Image file not found: ${imagePath}${colors.reset}`);
    process.exit(1);
  }

  const converter = new ImageToJSONConverter();
  
  try {
    const { jsonOutput, outputPath } = await converter.generateJSON(imagePath);
    
    // Validate JSON
    console.log(`${colors.fg.cyan}🔍 Validating JSON...${colors.reset}\n`);
    const validation = await converter.validateJSON(jsonOutput);
    
    if (validation.valid) {
      console.log(`${colors.fg.green}✅ JSON is valid!${colors.reset}\n`);
      
      // Save clean JSON
      const cleanJsonPath = outputPath.replace('.json', '-clean.json');
      fs.writeFileSync(cleanJsonPath, JSON.stringify(validation.parsed, null, 2));
      console.log(`${colors.fg.green}✅ Clean JSON saved to: ${cleanJsonPath}${colors.reset}\n`);
    } else {
      console.log(`${colors.fg.red}❌ JSON validation failed: ${validation.error}${colors.reset}\n`);
    }
    
    console.log(`${colors.fg.green}✨ Conversion complete!${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.fg.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();

