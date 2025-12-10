# WaveMaker ReAct Agent - Automated Testing Guide

Complete guide for running automated tests with OpenAI + MCP.

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd /Users/raajr_500278/ai/wavemaker-rn-mcp/prompt-tests
npm install

# 2. Set API key
export OPENAI_API_KEY=sk-...

# 3. Build MCP server (if not already built)
cd ..
npm run build

# 4. Run test
cd prompt-tests
node test-runner.js --test 1.1
```

## 📋 Prerequisites

### 1. OpenAI API Key

Get your API key: https://platform.openai.com/api-keys

```bash
export OPENAI_API_KEY=sk-...
```

**Recommended Models:**
- `gpt-4o` - Best instruction following (recommended)
- `gpt-4-turbo` - Fast, excellent quality
- `gpt-3.5-turbo` - Budget option

### 2. MCP Server Built

```bash
cd /Users/raajr_500278/ai/wavemaker-rn-mcp
npm run build
```

### 3. Dependencies Installed

```bash
cd prompt-tests
npm install
```

Required packages:
- `openai` - Official OpenAI SDK
- `@modelcontextprotocol/sdk` - MCP client

## 🧪 Running Tests

### Single Test

```bash
node test-runner.js --test 1.1
```

### Example Output

```bash
🧪 Running Test 1.1

📡 Connecting to MCP server...
✅ Connected to MCP server

Query: How do I use the Button widget?

Loaded 50 MCP tools

  Iteration 1
    🚫 BLOCK: Providing paths
  Iteration 2
    🔧 1 tool(s) called
       → search_widget_by_name
  Iteration 3
    🔧 1 tool(s) called
       → read_widget_structure
  Iteration 4
    ✅ COMPLETE

📝 Saved actual output: actual/1.1-run-1733845678901.json

🔍 Validating Agent Response

1. Tool Selection
  ✅ Tool called: search_widget_by_name
  ✅ Tool called: read_widget_structure

2. Data Accuracy
  ✅ All 17 props documented
  ✅ All 1 events documented
  ✅ Key style classes documented

3. Completeness
  ✅ Props table present
  ✅ Events section present
  ✅ Style section present
  ✅ 3 code examples provided
  ✅ Evidence trail present

4. Answer Quality
  ✅ Answer is actionable
  ✅ Code examples are runnable
  ✅ Well-structured answer (5 sections)

5. Context Management
  ✅ Session context tracked
  ✅ Task context tracked
  ✅ Correct decision flow

============================================================
✅ Test 1.1: 95/100 points
============================================================

Category Breakdown:

  toolSelection        ████████████████████ 20/20
  dataAccuracy         ████████████████████ 30/30
  completeness         ███████████████████░ 23/25
  answerQuality        ███████████████░░░░░ 13/15
  contextManagement    ████████████████░░░░ 9/10

Issues Found:
  ⚠️  Missing 1 code example (expected 4, got 3)
  ⚠️  Missing task context key: widgetFiles

👋 Disconnected from MCP
```

## 📊 How It Works

### Architecture

```
┌─────────────┐
│ test-runner │ ──┐
└─────────────┘   │
                  │  1. Load WM_PROMPT.md
                  │  2. Connect to MCP
                  │  3. Initialize Gemini
                  │
┌─────────────┐   │
│   Gemini    │ ←─┘
│  API (AI)   │
└──────┬──────┘
       │
       │ 4. Generate with tools
       │ 5. Call functions
       ↓
┌─────────────┐
│ MCP Server  │ ──→ 50+ Tools
│ (wavemaker) │     (search, read, analyze)
└─────────────┘
       │
       │ 6. Return results
       ↓
┌─────────────┐
│  Capture    │ ──→ actual/1.1-run.json
│  Output     │
└─────────────┘
       │
       │ 7. Validate
       ↓
┌─────────────┐
│  Validator  │ ──→ Compare with expected
│             │     Score: 95/100
└─────────────┘
```

### Flow

1. **Load Test**: Read `expected/1.1-button-widget.json`
2. **Connect MCP**: Start MCP server, get 50+ tools
3. **Initialize Gemini**: Load WM_PROMPT.md as system instruction
4. **Agent Loop**:
   - Gemini generates response (THOUGHT → ACTION)
   - If function calls → Execute via MCP → Return results
   - If BLOCK → Provide paths automatically
   - If COMPLETE → Extract answer
5. **Capture**: Save tool calls, decisions, working memory, answer
6. **Validate**: Compare actual vs expected, calculate score

## 🔧 Gemini API Details

### Model

```javascript
model: 'gemini-2.0-flash-exp'
```

- Best for function calling
- Fast and cost-efficient
- 1M token context window

Reference: https://ai.google.dev/gemini-api/docs#javascript

### Configuration

```javascript
const config = {
  systemInstruction: WM_PROMPT.md,  // ReAct pattern
  temperature: 0.7,                  // Balanced creativity
  tools: [{ functionDeclarations }]  // MCP tools
};
```

### Multi-turn Conversation

```javascript
const contents = [
  { role: 'user', parts: [{ text: 'Query' }] },
  { role: 'model', parts: [{ functionCall }] },
  { role: 'user', parts: [{ functionResponse }] },
  ...
];
```

### Function Calling

```javascript
// Gemini calls function
chunk.functionCalls[0] = {
  name: 'search_widget_by_name',
  args: { widgetName: 'Button', ... }
}

// Execute via MCP
const result = await mcpClient.callTool({
  name: call.name,
  arguments: call.args
});

// Return to Gemini
{ 
  role: 'user',
  parts: [{
    functionResponse: {
      name: call.name,
      response: { result }
    }
  }]
}
```

## 📁 File Structure

```
prompt-tests/
├── test-runner.js          # Main runner (Gemini + MCP)
├── validator.js            # Validator (compares JSON)
├── package.json            # Dependencies
│
├── expected/               # Ground truth
│   └── 1.1-button-widget.json
│
├── actual/                 # Captured outputs
│   └── 1.1-run-<timestamp>.json
│
└── test-scenarios/         # Test queries
    └── 01-widget-discovery.txt
```

## 🎯 Expected JSON Format

```json
{
  "testId": "1.1",
  "query": "How do I use the Button widget?",
  "paths": {
    "runtimePath": "/path/to/runtime",
    "codegenPath": "/path/to/codegen"
  },
  "groundTruth": {
    "props": { "total": 17, "list": [...] },
    "events": { "total": 1, "list": [...] },
    "styles": { "parts": [...], "classes": [...] }
  },
  "expectedAnswer": {
    "mustDocument": {
      "criticalProps": ["caption", "onTap", ...],
      ...
    }
  }
}
```

## 🐛 Troubleshooting

### "GEMINI_API_KEY not set"

```bash
export GEMINI_API_KEY=AIzaSy...
# Get key: https://aistudio.google.com/apikey
```

### "MCP server not found"

```bash
# Build MCP server first
cd /Users/raajr_500278/ai/wavemaker-rn-mcp
npm run build
```

### "Cannot find module @google/genai"

```bash
cd prompt-tests
npm install
```

### "Test failed with low score"

Check validation output:
```bash
cat actual/1.1-run-<timestamp>.json
```

Common issues:
- Missing props in answer
- Wrong tools called
- Context not tracked
- Hallucinated data (props that don't exist)

## 📈 Scoring

| Category | Points | What's Validated |
|----------|--------|------------------|
| Tool Selection | 20 | Correct tools in correct order |
| Data Accuracy | 30 | Props match codebase, no hallucinations |
| Completeness | 25 | All required sections present |
| Answer Quality | 15 | Actionable, runnable examples |
| Context Management | 10 | Session/task context tracked, correct decisions |

**Pass:** 75/100

## 🚀 Next Steps

1. ✅ Test 1.1 passing → Create Test 1.2
2. ✅ All Widget tests passing → Create styling tests
3. ✅ All tests passing → CI/CD integration
4. 🎯 Regression testing before prompt changes

## 🔗 References

- Gemini API Docs: https://ai.google.dev/gemini-api/docs#javascript
- Get API Key: https://aistudio.google.com/apikey
- MCP SDK: https://github.com/modelcontextprotocol/sdk
- WaveMaker MCP: /Users/raajr_500278/ai/wavemaker-rn-mcp

