# WaveMaker Markup Validation Report

**File:** /Users/raajr_500278/ai/wavemaker-rn-mcp/prompt-tests/UI/test-results/generated-markup/chat-generated-1765643251051.xml
**Date:** 2025-12-13T16:27:31.079Z

════════════════════════════════════════════════════════════════════════════════

## Summary

- Total Checks: 15
- ✓ Passed: 12 (80.0%)
- ✗ Critical: 0
- ⚠ Warnings: 3
- ℹ Info: 0

## Warnings

### class attribute must equal name attribute
**Category:** mandatoryAttributes
**Rule:** classEqualsName
**Issue:** wm-label[name="dot1"]: class="dot" (should be "dot1"); wm-label[name="dot2"]: class="dot" (should be "dot2"); wm-label[name="dot3"]: class="dot" (should be "dot3")

### All class values must be unique
**Category:** mandatoryAttributes
**Rule:** uniqueClasses
**Issue:** "dot" used 3 times

### Images must have width and height
**Category:** widgetUsage
**Rule:** imagesHaveDimensions
**Issue:** illustration: missing width; illustration: missing height

## Passed Checks

- ✓ Must have wm-page → wm-content → wm-page-content structure
- ✓ Screen root container must have width="fill" and height="fill"
- ✓ All wm-container must have direction, gap, and alignment
- ✓ All wm-container should have width and height for better layout control
- ✓ All WaveMaker elements must have name and class attributes
- ✓ Forms must use wm-form-field, not standalone inputs
- ✓ wm-form title attribute must be empty
- ✓ Icons with iconclass should have caption=""
- ✓ No style="" attribute allowed (use CSS classes instead)
- ✓ No inline color/backgroundcolor attributes
- ✓ No inline padding/margin attributes
- ✓ No inline font attributes (fontsize, fontweight, etc.)
