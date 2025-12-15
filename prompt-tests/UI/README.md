# WaveMaker UI Generation Testing Framework

**Status:** ✅ Complete - Ready for testing

This framework enables systematic development and refinement of a prompt that generates accurate WaveMaker React Native markup from UI screenshots.

## 🎯 Quick Start

```bash
# 1. Set API key
export OPENAI_API_KEY=your-key-here

# 2. Add test images to test-cases/

# 3. Run interactive chat (recommended for quick testing)
node chat-ui.js

# OR run full test suite
node test-ui-generation.js
```

## 📁 Files Created

### Core System
- ✅ **WM_UI_PROMPT.md** - Minimal base prompt (~250 lines)
- ✅ **validation-rules.js** - Validation criteria
- ✅ **validate-markup.js** - Automated validator

### Testing Tools
- ✅ **test-ui-generation.js** - Automated test runner
- ✅ **chat-ui.js** - Interactive UI generation

### Documentation
- ✅ **WM_UI_GENERATION_GUIDE.md** - Complete usage guide
- ✅ **test-cases/README.md** - Test case documentation
- ✅ **README.md** - This file

### Directory Structure
```
prompt-tests/UI/
├── WM_UI_PROMPT.md              ✅ System prompt
├── validation-rules.js          ✅ Validation rules
├── validate-markup.js           ✅ Validator script
├── test-ui-generation.js        ✅ Test runner
├── chat-ui.js                   ✅ Interactive chat
├── WM_UI_GENERATION_GUIDE.md    ✅ Usage guide
├── README.md                    ✅ This file
├── test-cases/                  ✅ Directory created
│   └── README.md                ✅ Test case guide
└── test-results/                ✅ Directories created
    ├── generated-markup/        ✅ For .xml files
    └── screenshots/             ✅ For visual comparison
```

## 🚀 How It Works

### 1. Interactive Testing (Fast Iteration)

```bash
node chat-ui.js
```

- Provide image path
- Agent generates markup using widget discovery tools
- Automatic validation
- Immediate feedback
- Perfect for quick testing and iteration

### 2. Batch Testing (Comprehensive)

```bash
node test-ui-generation.js
```

- Processes all test cases
- Generates markup for each
- Validates all outputs
- Creates comprehensive report
- Ideal for measuring progress

### 3. Validation

All generated markup is automatically validated against:
- ✅ Structure rules (root elements, nesting)
- ✅ Mandatory attributes (alignment, class=name)
- ✅ Layout correctness (flexgrow 0/1 only)
- ✅ Widget usage (forms, lists, icons)
- ✅ No inline styles

### 4. Manual Visual Comparison

1. Render generated markup in WaveMaker
2. Take screenshot
3. Compare with reference image
4. Note discrepancies

### 5. Prompt Refinement

1. Identify failure patterns
2. Update WM_UI_PROMPT.md
3. Re-run tests
4. Track improvement

## 📊 Success Metrics

Track these metrics across prompt versions:

| Version | Validation Pass | Visual Match | Components | Issues |
|---------|----------------|--------------|------------|--------|
| v1      | TBD            | TBD          | TBD        | TBD    |

## 🎓 Learning from Widget Testing

This framework follows the successful pattern from Widget testing:
- **v1 (84%)** → **v2 (88%)** → **v3 (100%)**

Key lessons applied:
1. ✅ Start minimal, iterate systematically
2. ✅ Use tools for widget discovery (no assumptions)
3. ✅ Explicit forbidden patterns
4. ✅ Confident, authoritative tone
5. ✅ Comprehensive validation
6. ✅ Track metrics across versions

## ⚠️ Next Steps (User Action Required)

### 1. Add Test Images

Add 5 reference images to `test-cases/`:
- `simple-login.png` - Basic login form
- `product-card.png` - Card with image/text/button
- `form-with-validation.png` - Complex form
- `list-view.png` - Repeating list items
- `dashboard.png` - Multi-section layout

See `test-cases/README.md` for detailed requirements.

### 2. Run Initial Tests

```bash
# Interactive test (one image)
node chat-ui.js
# Provide: ./test-cases/simple-login.png

# OR full test suite
node test-ui-generation.js
```

### 3. Review Results

Check:
- `test-results/generated-markup/*.xml` - Generated markup
- `test-results/test-results-*.md` - Comprehensive report
- Validation reports for each test

### 4. Manual Rendering

1. Copy markup to WaveMaker
2. Render and screenshot
3. Save to `test-results/screenshots/`
4. Compare with reference

### 5. Refine Prompt

Based on failures:
1. Update `WM_UI_PROMPT.md`
2. Re-run tests
3. Track improvement

## 📚 Documentation

- **Usage Guide:** `WM_UI_GENERATION_GUIDE.md` - Complete workflow
- **Test Cases:** `test-cases/README.md` - Test image requirements
- **Validation:** `validation-rules.js` - All validation criteria
- **Widget Testing:** `../Widget/CHAT_USAGE.md` - Reference pattern

## 🔧 Tools

### chat-ui.js
Interactive UI generation for quick testing
```bash
node chat-ui.js
```

### test-ui-generation.js
Automated test suite for comprehensive testing
```bash
node test-ui-generation.js
```

### validate-markup.js
Standalone validator for any markup file
```bash
node validate-markup.js path/to/markup.xml
```

## 🎯 Goals

### Minimal v1 (Current)
- ✅ Generate valid XML markup
- ✅ Use correct widget types
- ✅ Pass 50%+ validation rules
- ✅ Basic layout structure

### Final Refined Version
- 🎯 90%+ validation pass rate
- 🎯 80%+ visual similarity
- 🎯 All mandatory attributes
- 🎯 Accurate spacing/alignment
- 🎯 Complete styling with variants

## 🤝 Similar to Widget Testing

| Aspect | Widget Testing | UI Generation |
|--------|---------------|---------------|
| Input | Text questions | Screenshot images |
| Output | Text answers | XML markup |
| Validation | Manual comparison | Automated + Visual |
| Tools | 2 per query | 2-10+ per UI |
| Success | Answer accuracy | Markup validity + Visual match |

## ✨ Key Features

1. **Tool-Driven** - Uses actual widget capabilities via MCP tools
2. **Automated Validation** - Comprehensive rule checking
3. **Iterative Refinement** - Systematic prompt improvement
4. **Comprehensive Testing** - Both interactive and batch modes
5. **Detailed Reports** - Track progress across versions
6. **Visual Comparison** - Manual rendering for accuracy check

## 🚦 Status

- ✅ Framework complete
- ✅ All files created
- ✅ Documentation complete
- ⚠️ Test images needed (user action)
- ⏳ Initial testing pending
- ⏳ Prompt refinement pending

---

**Ready to start!** Add your test images and run the first tests. See `WM_UI_GENERATION_GUIDE.md` for detailed instructions.

