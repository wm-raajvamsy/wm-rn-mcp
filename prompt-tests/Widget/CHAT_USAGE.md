# Widget Understanding Chat - Usage Guide

## Quick Start

```bash
# 1. Set your OpenAI API key
export OPENAI_API_KEY=your-key-here

# 2. Start the chat
node chat-widget.js
```

## What It Does

The chat:
- Uses `WM_WIDGET_PROMPT.md` as system prompt
- Connects to MCP server for widget analysis tools
- Lets you ask questions about any widget
- Agent calls tools automatically to get accurate data
- Answers based ONLY on tool results (no hallucinations)

## Example Conversation

```
You: How many props does Button have?

Agent: [calls search_widget_by_name → read_widget_structure]
The Button widget has 18 props.

─────────────────────────────────────────────────

You: What events does Text widget support?

Agent: [calls tools]
The Text widget supports 3 events:
- onSubmitEditing
- onFieldChange
- triggerValidation

─────────────────────────────────────────────────

You: How do I style the Button?

Agent: [calls tools]
The Button widget uses the default class "app-button" and has 20 style classes available:
- btn-primary (affects root part)
- btn-danger (affects root part)
- btn-success (affects root part)
- fab-btn (floating action button)
...
```

## Testing Scenarios

### Test 1: Prop Counting
**Question:** "How many props does [Widget] have?"

**Expected Behavior:**
- Agent calls `search_widget_by_name` and `read_widget_structure`
- Returns exact count from `props.length`
- No guessing or estimating

**Validation:**
- Button: Should say 18
- Text: Should say 28
- Picture: Should say 15

### Test 2: Event Listing
**Question:** "What events are available for [Widget]?"

**Expected Behavior:**
- Agent calls tools
- Lists ALL events from `events` array
- Doesn't add events from memory

**Validation:**
- Button: onTap (1 event)
- Text: onSubmitEditing, onFieldChange, triggerValidation (3 events)
- Picture: No events (should say 0 or none)

### Test 3: Styling Information
**Question:** "How do I style the text in Button?"

**Expected Behavior:**
- Agent calls tools
- Checks `styles.classToPartMapping`
- Finds classes that affect "text" part
- Suggests "app-button-text" class

**Validation:**
- Should mention "app-button-text" maps to "text" part
- Shouldn't suggest made-up classes

### Test 4: Inheritance
**Question:** "Does Text widget inherit props? From where?"

**Expected Behavior:**
- Agent calls tools
- Checks `inheritance.chain`
- Reports parent classes

**Validation:**
- Should say Text inherits from BaseInputProps
- Should mention 21 inherited props, 7 own props

### Test 5: Widget Comparison
**Question:** "Which has more props, Button or Text?"

**Expected Behavior:**
- Agent calls tools for both widgets
- Compares `props.length`
- Gives accurate comparison

**Validation:**
- Should say Text (28) has more than Button (18)

## Commands

- `clear` - Reset conversation (clears history)
- `quit` or `exit` - End chat session

## Ground Truth (For Manual Validation)

### Button Widget
- Total Props: 18
- Events: 1 (onTap)
- Style Classes: 20
- Key Classes: btn-primary, btn-danger, fab-btn
- Parent: BaseProps

### Text Widget
- Total Props: 28 (7 own + 21 inherited)
- Events: 3 (onSubmitEditing, onFieldChange, triggerValidation)
- Style Classes: 14
- Key Classes: app-text, app-text-invalid, app-text-focused
- Parent: BaseInputProps → BaseProps

### Picture Widget
- Total Props: 15
- Events: 0
- Style Classes: 4
- Key Classes: app-picture
- Parent: BaseProps

## What to Look For

### ✅ Good Responses:
- Exact counts (not "around 15" or "typically 10-20")
- Lists all items from tool data
- Mentions actual class names from codebase
- Says "I don't have the paths" if paths not provided
- Calls tools before answering

### ❌ Bad Responses:
- Vague counts ("several props", "many events")
- Lists "common" or "typical" props not in tool data
- Suggests classes that don't exist
- Answers without calling tools
- Adds information from training data

## Tips

1. **Start with basic questions** (count queries) to verify accuracy
2. **Ask for lists** (what props/events) to check completeness
3. **Ask about specific features** (styling, inheritance) to test understanding
4. **Compare widgets** to test multi-widget analysis
5. **Try edge cases** (widgets with 0 events, complex inheritance)

## Troubleshooting

**Chat hangs after question:**
- MCP server might have crashed
- Restart the chat

**Wrong answers:**
- Check if agent called tools (you'll see "→ Calling..." messages)
- If no tools called, prompt might need adjustment
- If tools called but wrong answer, LLM might be hallucinating

**API errors:**
- Check OPENAI_API_KEY is set
- Check you have API credits
- Try again (might be rate limit)

---

**Ready to test! Start asking questions and manually verify the answers against the ground truth above.**

