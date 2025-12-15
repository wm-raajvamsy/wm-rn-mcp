# WaveMaker UI Generation - Usage Guide

## Overview

This testing framework helps develop and refine a prompt that generates accurate WaveMaker React Native markup from UI screenshots. It follows the same successful pattern used for Widget testing.

## Quick Start

### 1. Set Up Environment

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-key-here

# Navigate to UI test directory
cd prompt-tests/UI
```

### 2. Interactive Chat (Recommended for Testing)

```bash
# Start the interactive chat
node chat-ui.js
```

Provide an image path and the agent will:
- Generate WaveMaker markup
- Validate it automatically
- Save markup and validation report
- Show results immediately

**Example session:**
```
Image path: ./test-cases/simple-login.png

Agent: [generates markup]
💾 Saved to: test-results/generated-markup/chat-generated-1234567890.xml

Validating markup...
✓ Passed: 15/20 checks
⚠ Warnings: 5
```

### 3. Automated Test Suite

```bash
# Run all test cases
node test-ui-generation.js
```

This will:
- Process all test images in `test-cases/`
- Generate markup for each
- Validate all markup
- Save comprehensive report

## File Structure

```
prompt-tests/UI/
├── WM_UI_PROMPT.md              # System prompt (iteratively refined)
├── chat-ui.js                   # Interactive UI generation
├── test-ui-generation.js        # Automated test runner
├── validate-markup.js           # Markup validator
├── validation-rules.js          # Validation criteria
├── WM_UI_GENERATION_GUIDE.md    # This file
├── test-cases/                  # Reference images
│   ├── simple-login.png
│   ├── product-card.png
│   └── ...
└── test-results/                # Generated outputs
    ├── generated-markup/        # .xml files
    ├── screenshots/             # Your rendered screenshots
    └── test-results-*.md        # Test reports
```

## Workflow

### Phase 1: Generate Markup

**Option A: Interactive (for quick testing)**
```bash
node chat-ui.js
# Provide image path
# Review generated markup
# Iterate quickly
```

**Option B: Batch (for comprehensive testing)**
```bash
node test-ui-generation.js
# Processes all test cases
# Generates full report
```

### Phase 2: Manual Rendering

1. Open generated markup file (e.g., `test-results/generated-markup/test-1-simple-login.xml`)
2. Copy markup into WaveMaker
3. Render the UI
4. Take a screenshot
5. Save to `test-results/screenshots/test-1-simple-login.png`

### Phase 3: Visual Comparison

Compare your screenshot with the reference image:
- Reference: `test-cases/simple-login.png`
- Generated: `test-results/screenshots/test-1-simple-login.png`

Check for:
- ✅ Correct components used
- ✅ Layout matches (rows, columns, nesting)
- ✅ Spacing is accurate
- ✅ Alignment is correct
- ✅ Visual appearance is similar

### Phase 4: Analyze & Refine

1. **Review validation reports** (auto-generated)
   - Critical issues (must fix)
   - Warnings (should fix)
   - Info (nice to fix)

2. **Identify patterns**
   - Same issue across multiple tests?
   - Specific widget types problematic?
   - Layout rules not followed?
   - Spacing consistently wrong?

3. **Update prompt** (`WM_UI_PROMPT.md`)
   - Add explicit rules for common failures
   - Include examples of correct patterns
   - Add forbidden patterns section
   - Clarify ambiguous instructions

4. **Re-run tests**
   ```bash
   node test-ui-generation.js
   ```

5. **Track improvement**
   - Compare validation pass rates
   - Note which issues were fixed
   - Document remaining issues

## Validation Rules

The validator checks for:

### Critical Issues (Must Fix)
- ❌ Missing root structure (wm-page → wm-content → wm-page-content)
- ❌ Missing mandatory attributes (horizontalalign, verticalalign)
- ❌ Invalid flexgrow values (only 0 or 1 allowed)
- ❌ Standalone inputs in forms (must use wm-form-field)
- ❌ Inline style attributes (color, padding, margin, etc.)

### Warnings (Should Fix)
- ⚠️ class not equal to name
- ⚠️ Duplicate class values
- ⚠️ Form title not empty
- ⚠️ Icons with both iconclass and caption
- ⚠️ Images missing width/height

### Info (Nice to Fix)
- ℹ️ Widgets not wrapped in flexgrow="0"
- ℹ️ Suboptimal layout patterns

## Test Cases

### Current Test Suite

1. **Simple Login Form** (simple)
   - 2 text inputs, 1 button
   - Tests: forms, form-fields, basic layout

2. **Product Card** (simple)
   - Image, labels, button in container
   - Tests: containers, images, vertical stacking

3. **Form with Validation** (medium)
   - Multiple field types, validation states
   - Tests: complex forms, field types, states

4. **List View** (medium)
   - Repeating card items
   - Tests: lists, templates, data binding

5. **Dashboard** (complex)
   - Multiple sections, mixed layouts
   - Tests: complex nesting, spacing, alignment

### Adding New Test Cases

1. Add image to `test-cases/`
2. Update `TEST_CASES` array in `test-ui-generation.js`:
   ```javascript
   {
     id: 6,
     name: "Your Test Name",
     image: "test-cases/your-image.png",
     description: "What this tests",
     expectedComponents: ["wm-*", "wm-*"],
     complexity: "simple|medium|complex"
   }
   ```
3. Run test suite

## Prompt Refinement Strategy

### Version Tracking

Track prompt evolution like Widget tests:
- v1: Minimal baseline (~200 lines)
- v2: Add missing widget patterns
- v3: Fix spacing issues
- v4: Improve form handling
- etc.

### Metrics to Track

| Version | Tests | Validation Pass | Visual Match | Issues |
|---------|-------|----------------|--------------|--------|
| v1      | 5/5   | 40%            | 20%          | [list] |
| v2      | 5/5   | 60%            | 40%          | [list] |
| v3      | 5/5   | 80%            | 60%          | [list] |

### Common Failure Patterns

Based on Widget testing experience:

1. **"Data not found" syndrome**
   - LLM says it doesn't have information
   - **Fix:** Explicitly state "You HAVE the data from tools"

2. **Tentative language**
   - "It seems like...", "Probably..."
   - **Fix:** Require confident, authoritative tone

3. **Generic advice**
   - Using training data instead of actual widget props
   - **Fix:** "EVERYTHING from tool response, nothing from training"

4. **Missing mandatory attributes**
   - Forgetting horizontalalign, etc.
   - **Fix:** Checklist in prompt, explicit examples

5. **Wrong layout patterns**
   - Using CSS instead of wm-linearlayout
   - **Fix:** Clear rules, forbidden patterns section

## Success Criteria

### For Minimal v1 Prompt
- ✅ Generates valid XML markup
- ✅ Uses correct widget types
- ✅ Passes 50%+ validation rules
- ✅ Basic layout structure correct
- ⚠️ Spacing may not be perfect
- ⚠️ Styling may be basic

### For Final Refined Prompt
- ✅ 90%+ validation pass rate
- ✅ 80%+ visual similarity
- ✅ All mandatory attributes present
- ✅ Correct spacing and alignment
- ✅ Proper widget selection
- ✅ Complete styling with variants

## Tips

1. **Start simple** - Test with simple UIs first
2. **One issue at a time** - Fix one pattern, re-test, iterate
3. **Use chat for quick iteration** - Faster than full test suite
4. **Document everything** - Track what works, what doesn't
5. **Compare with Widget prompt** - Similar patterns, similar solutions
6. **Be specific in prompt** - Vague instructions = inconsistent results
7. **Show examples** - Concrete examples > abstract rules
8. **Forbid explicitly** - Tell LLM what NOT to do

## Troubleshooting

### Chat hangs after image
- MCP server might have crashed
- Restart chat

### Validation fails on all tests
- Check WM_UI_PROMPT.md has all mandatory rules
- Review validation-rules.js for correctness

### Generated markup is invalid XML
- LLM might be wrapping in markdown
- Extractor should handle this automatically

### Visual output doesn't match
- Check validation report first
- If validation passes but visual wrong:
  - Spacing rules may need refinement
  - Alignment logic may be incorrect
  - Widget selection may be wrong

### Tools not being called
- Check MCP server is running
- Check paths are correct
- Review system prompt tool calling instructions

## Next Steps

1. **Add your test images** to `test-cases/`
2. **Run chat-ui.js** for quick testing
3. **Review generated markup** and validation
4. **Render in WaveMaker** and screenshot
5. **Compare visually** with reference
6. **Identify patterns** in failures
7. **Update prompt** to address issues
8. **Re-run tests** and track improvement
9. **Iterate** until success criteria met

## Resources

- Widget Testing Guide: `../Widget/CHAT_USAGE.md`
- Widget Prompt: `../Widget/WM_WIDGET_PROMPT.md`
- Validation Rules: `validation-rules.js`
- Test Results: `test-results/test-results-*.md`

---

**Remember:** This is an iterative process. The Widget prompt went from 84% → 88% → 100% accuracy through systematic refinement. Expect the same journey for UI generation!

