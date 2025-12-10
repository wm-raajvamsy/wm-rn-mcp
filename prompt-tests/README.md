# WaveMaker ReAct Agent Testing

Ground-truth validation system for the ReAct prompt agent.

## Approach

```
1. Create ground truth from actual codebase (manual inspection)
2. Save as expected JSON
3. Run agent with test query
4. Capture agent output as JSON
5. Compare with validator
```

## Structure

```
prompt-tests/
├── README.md                    # This file
├── validator.js                 # Simple JSON comparator (200 lines)
│
├── test-scenarios/
│   └── 01-widget-discovery.txt  # Test queries (plain text)
│
├── expected/                    # Ground truth (manually verified)
│   └── 1.1-button-widget.json   # Based on actual codebase
│
└── actual/                      # Agent outputs
    └── 1.1-run-<timestamp>.json # Captured from agent
```

## Quick Start

### 1. Run Agent

```bash
# Load prompt
cat /Users/raajr_500278/ai/wavemaker-rn-mcp/WM_PROMPT.md

# Ask test query (from test-scenarios/)
"How do I use the Button widget?"

# Provide paths when asked:
runtimePath: /Users/raajr_500278/wavemaker-studio-frontend/wavemaker-rn-runtime/lib/module
codegenPath: /Users/raajr_500278/wavemaker-studio-frontend/wavemaker-rn-codegen/build
```

### 2. Capture Output

Save agent's response in this format:

```json
{
  "testId": "1.1",
  "toolCalls": [
    {
      "tool": "search_widget_by_name",
      "params": { "widgetName": "Button", ... }
    },
    {
      "tool": "read_widget_structure",
      "params": { "filePath": "/path/to/button.component.js", ... }
    }
  ],
  "decisions": ["BLOCK", "CONTINUE", "COMPLETE"],
  "workingMemory": {
    "session": {
      "runtimePath": "/path...",
      "codegenPath": "/path..."
    },
    "task": {
      "widgetName": "Button",
      "widgetFiles": [...]
    }
  },
  "answer": {
    "propsDocumented": ["caption", "badgevalue", "iconclass", ...],
    "eventsDocumented": ["onTap"],
    "styleClassesDocumented": ["btn-primary", "btn-success", ...],
    "hasPropsTable": true,
    "hasEventsSection": true,
    "hasStyleSection": true,
    "codeExamples": 3,
    "sections": 5,
    "isActionable": true,
    "examplesRunnable": true,
    "hasEvidenceTrail": true
  }
}
```

Save to: `actual/1.1-run-$(date +%s).json`

### 3. Validate

```bash
cd /Users/raajr_500278/ai/wavemaker-rn-mcp/prompt-tests

node validator.js \
  expected/1.1-button-widget.json \
  actual/1.1-run-1234567890.json

# Output:
# ✅ Test 1.1: 87/100 points
# 
# Category Breakdown:
#   toolSelection        ████████████████████ 20/20
#   dataAccuracy         ██████████████████░░ 27/30
#   completeness         ████████████████████ 25/25
#   answerQuality        ███████████████░░░░░ 12/15
#   contextManagement    ████████████████████ 10/10
# 
# Issues Found:
#   ⚠️  Missing 3 props: iconurl, iconmargin, hint
```

## Ground Truth Format

Expected JSON contains:
- **Ground truth data**: Verified from actual codebase
- **Expected behavior**: Tools, decisions, context
- **Validation rules**: What must be documented

See `expected/1.1-button-widget.json` for complete example.

## Scoring

| Category | Points | What's Checked |
|----------|--------|----------------|
| Tool Selection | 20 | Right tools called in right order |
| Data Accuracy | 30 | Props/events match codebase, no hallucinations |
| Completeness | 25 | All required sections present |
| Answer Quality | 15 | Actionable, runnable examples, clear structure |
| Context Management | 10 | Session/task context tracked, correct decisions |

**Pass threshold:** 75/100

## Creating New Tests

### Step 1: Inspect Codebase

```bash
# Find widget
ls /path/to/wavemaker-rn-runtime/lib/module/components/

# Read actual files
cat button.props.js    # Count props, note defaults
cat button.styles.js   # Count style parts and classes
cat button.component.js # Check events
```

### Step 2: Create Expected JSON

```json
{
  "testId": "1.2",
  "query": "What widgets can display lists?",
  "groundTruth": {
    "source": "Verified from codebase on 2024-12-09",
    "component": {
      "name": "WmList",
      ...
    },
    "props": {
      "total": 12,
      "list": ["dataset", "itemsperrow", ...]
    }
  },
  "expectedAnswer": {
    "mustDocument": {
      "criticalProps": ["dataset", "itemsperrow"],
      ...
    }
  }
}
```

Save to: `expected/1.2-list-widgets.json`

### Step 3: Add Query

```text
# test-scenarios/01-widget-discovery.txt

## Test 1.2: List Widgets
**Query:** What widgets can display lists?
**Expected file:** expected/1.2-list-widgets.json
```

### Step 4: Test

Run agent → Capture output → Validate

## Benefits

✅ **Ground Truth**: Expected data verified by human, not generated  
✅ **Simple**: 200-line validator vs 670-line parser  
✅ **Accurate**: No regex brittleness, direct JSON comparison  
✅ **Maintainable**: Update expected JSON when codebase changes  
✅ **Clear**: Exact diffs show what's missing  
✅ **Regression-proof**: Tests catch when agent starts hallucinating

## Example Validation

```bash
$ node validator.js expected/1.1-button-widget.json actual/1.1-run.json

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
  completeness         ███████████████████░ 22/25
  answerQuality        ███████████████░░░░░ 13/15
  contextManagement    ████████████████████ 10/10

Issues Found:
  ⚠️  Expected 4 structured sections, got 3
  ⚠️  Code examples may lack error handling
```

## Next Steps

1. ✅ Test 1.1 created (Button widget)
2. 📝 Create Test 1.2 (List widgets)
3. 📝 Create Test 1.3 (Form widgets)
4. 📝 Create Test 2.1 (Button styling)
5. 🚀 Run regression suite before prompt changes

---

**Status:** Ground-truth system operational  
**Tests defined:** 1 (Button widget)  
**Tests passing:** Run first test to find out!
