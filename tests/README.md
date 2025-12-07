# Comprehensive Test Suite for Codebase Tools

This test suite provides complete coverage for all 35 codebase tools across 7 categories, plus integration workflows, edge cases, and performance benchmarks.

## Test Structure

```
tests/
├── utils/
│   ├── test-helpers.js      # Validation helpers, path checking, mock data
│   └── test-runner.js        # Test runner with reporting
├── category/
│   ├── base-component.test.js       # 6 base component tools (18 tests)
│   ├── widget-component.test.js     # 5 widget tools (19 tests)
│   ├── style-theme.test.js          # 7 style/theme tools (21 tests)
│   ├── transpiler-codegen.test.js   # 6 transpiler tools (18 tests)
│   ├── variable-binding.test.js     # 5 variable/binding tools (15 tests)
│   ├── fragment-page.test.js        # 3 fragment/page tools (10 tests)
│   └── service-di.test.js           # 3 service/DI tools (10 tests)
├── integration/
│   └── workflows.test.js             # Integration workflow tests (8 tests)
├── edge-cases.test.js                # Edge cases & error handling (15 tests)
├── performance.test.js               # Performance benchmarks (13 tests)
└── run-all-tests.js                  # Master test runner
```

## Total Coverage

- **35 Tools Tested**: 100% coverage of all codebase tools
- **~150 Test Scenarios**: Comprehensive test cases for each tool
- **10 Test Suites**: Organized by category and purpose

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Category-Specific Tests
```bash
npm run test:base-component       # Base component tools (6 tools)
npm run test:widget-component     # Widget component tools (5 tools)
npm run test:style-theme          # Style & theme tools (7 tools)
npm run test:transpiler-codegen   # Transpiler & codegen tools (6 tools)
npm run test:variable-binding     # Variable & binding tools (5 tools)
npm run test:fragment-page        # Fragment & page tools (3 tools)
npm run test:service-di           # Service & DI tools (3 tools)
```

### Run Specialized Tests
```bash
npm run test:integration          # Integration workflows
npm run test:edge-cases           # Edge cases & error handling
npm run test:performance          # Performance benchmarks
```

## Test Categories

### 1. Base Component Tools (6 tools)
Tests for BaseComponent infrastructure, lifecycle hooks, properties, events, and hierarchy analysis.

**Tools Tested:**
- `search_base_component` - Search BaseComponent implementation
- `read_base_component` - Read and parse BaseComponent structure
- `search_lifecycle_hooks` - Find lifecycle hook patterns
- `search_props_provider` - Find PropsProvider implementation
- `search_event_notifier` - Find event system implementation
- `analyze_component_hierarchy` - Analyze component inheritance

### 2. Widget Component Tools (5 tools)
Tests for widget search, structure reading, catalog listing, and property definitions.

**Tools Tested:**
- `search_widget_components` - Search for widget implementations
- `read_widget_structure` - Read widget file structure
- `search_widget_by_name` - Find specific widget by name
- `list_all_widgets` - List all available widgets
- `search_widget_props` - Find widget property definitions

### 3. Style & Theme Tools (7 tools)
Tests for style definitions, class names, theme compilation, CSS transforms, and precedence.

**Tools Tested:**
- `search_style_definitions` - Find style definition files
- `search_class_names` - Extract rnStyleSelector class names
- `search_theme_compilation` - Find theme compilation logic
- `search_css_to_rn` - Find CSS to RN transformation
- `read_theme_variables` - Read theme variable definitions
- `search_nested_styles` - Find nested style patterns
- `analyze_style_precedence` - Analyze style precedence rules

### 4. Transpiler & Codegen Tools (6 tools)
Tests for transpiler engine, transformers, parsers, templates, and build flow.

**Tools Tested:**
- `search_transpiler_engine` - Find transpiler implementation
- `search_transformer_registry` - Find transformer registry
- `search_html_parser` - Find HTML/markup parser
- `search_css_parser` - Find CSS/LESS parser
- `search_template_system` - Find template system
- `search_build_flow` - Find build pipeline

### 5. Variable & Binding Tools (5 tools)
Tests for variable system, bindings, watchers, and variable types.

**Tools Tested:**
- `search_variable_system` - Find variable system implementation
- `search_binding_mechanism` - Find data binding implementation
- `search_watcher_system` - Find watch system implementation
- `search_variable_types` - Find specific variable types
- `analyze_binding_flow` - Analyze data binding flow

### 6. Fragment & Page Tools (3 tools)
Tests for fragment system, page structure, and prefabs.

**Tools Tested:**
- `search_fragment_system` - Find fragment system implementation
- `search_page_structure` - Find page structure implementation
- `search_prefab_system` - Find prefab system implementation

### 7. Service & DI Tools (3 tools)
Tests for runtime services, dependency injection, and service layer.

**Tools Tested:**
- `search_runtime_services` - Find runtime services
- `search_di_system` - Find dependency injection system
- `search_service_layer` - Find service layer architecture

## Integration Workflows

Tests complete workflows across multiple tools:

1. **Component Discovery to Style Application**
   - search_widget_by_name → read_widget_structure → search_style_definitions → search_class_names

2. **Page Creation Flow**
   - search_fragment_system → search_page_structure → search_transpiler_engine → search_template_system

3. **Variable Binding Flow**
   - search_variable_system → search_binding_mechanism → search_watcher_system

## Edge Cases & Error Handling

Tests for robustness and error handling:
- Invalid paths (nonexistent directories)
- Empty and whitespace-only queries
- Extremely long query strings (1000+ chars)
- Special characters and Unicode in queries
- Invalid parameter values (negative, zero, invalid enums)
- Missing required parameters
- Concurrent tool executions (5, 10, 20 parallel)
- File read errors

## Performance Benchmarks

Performance tests with thresholds:
- **Max Execution Time**: 5 seconds per tool
- **Acceptable Execution Time**: 2 seconds (ideal)
- **Parallel Overhead**: 1.5x (50% overhead acceptable)

Tests include:
- Execution time benchmarks for all tool categories
- Large result set handling (50+ results)
- Sequential vs parallel execution comparison
- Repeated search performance
- Deep search with large maxResults

## Environment Configuration

Set environment variables to configure test paths:

```bash
export TEST_RUNTIME_PATH=/path/to/@wavemaker/app-rn-runtime
export TEST_CODEGEN_PATH=/path/to/@wavemaker/rn-codegen
export TEST_TIMEOUT=30000
export TEST_VERBOSE=true
```

Default paths (if not set):
- `TEST_RUNTIME_PATH`: `/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/app-rn-runtime`
- `TEST_CODEGEN_PATH`: `/Users/raajr_500278/ai/test/generated-rn-app/node_modules/@wavemaker/rn-codegen`

## Validation Criteria

Each test validates:
1. **Success Flag**: `result.success === true` for valid inputs
2. **Data Structure**: Correct shape of `result.data`
3. **Meta Information**: Contains `domain`, `executionTimeMs`
4. **Result Count**: Files/items found > 0 for expected results
5. **Performance**: Execution time < 5000ms
6. **Error Messages**: Clear error messages for failures

## Test Output

Tests provide detailed output:
- ✅ Passed tests with execution time
- ❌ Failed tests with reason
- 📊 Summary with pass rate and timing
- 🎉 Success celebration for all passing tests
- ⚠️  Warning for failed tests with details

## Success Metrics

- ✅ 100% tool coverage (35/35 tools)
- ✅ 3-5 test scenarios per tool
- ✅ All edge cases covered
- ✅ Integration workflows validated
- ✅ Performance benchmarks established
- ✅ Clear test documentation

## Contributing

When adding new tools:
1. Add tool tests to appropriate category file
2. Update this README with tool description
3. Add test script to `package.json`
4. Ensure tests follow validation criteria
5. Run full test suite to verify

## Troubleshooting

### Tests Fail with "Path not found"
- Ensure `TEST_RUNTIME_PATH` and `TEST_CODEGEN_PATH` are set correctly
- Verify the paths exist and contain the expected codebase

### Tests Timeout
- Increase `TEST_TIMEOUT` environment variable
- Check if the codebase is very large (10,000+ files)
- Run individual test suites instead of full suite

### Performance Tests Fail
- Performance thresholds may need adjustment for different hardware
- Check system resources (CPU, memory)
- Review execution time expectations in performance.test.js

