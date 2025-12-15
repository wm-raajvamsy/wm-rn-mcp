#!/usr/bin/env node

/**
 * WaveMaker Markup Validator
 * 
 * Validates generated WaveMaker markup against all rules
 * Outputs detailed report with line numbers and severity
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import { VALIDATION_RULES, SEVERITY_LEVELS } from './validation-rules.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

class MarkupValidator {
  constructor(markupPath) {
    this.markupPath = markupPath;
    this.markup = null;
    this.dom = null;
    this.results = {
      critical: [],
      warning: [],
      info: [],
      passed: []
    };
  }

  loadMarkup() {
    try {
      this.markup = fs.readFileSync(this.markupPath, 'utf-8');
      this.dom = new JSDOM(this.markup, { contentType: 'text/xml' });
      return true;
    } catch (error) {
      console.error(`${colors.red}Error loading markup: ${error.message}${colors.reset}`);
      return false;
    }
  }

  validate() {
    if (!this.loadMarkup()) {
      return false;
    }

    const doc = this.dom.window.document;

    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║           WaveMaker Markup Validator                       ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.blue}File: ${this.markupPath}${colors.reset}\n`);

    // Run all validation rules
    let totalChecks = 0;
    let passedChecks = 0;

    for (const [category, rules] of Object.entries(VALIDATION_RULES)) {
      console.log(`${colors.cyan}${category.toUpperCase()}:${colors.reset}`);
      
      for (const [ruleName, rule] of Object.entries(rules)) {
        totalChecks++;
        const result = rule.check(doc);
        
        if (result.pass) {
          passedChecks++;
          this.results.passed.push({ category, ruleName, rule });
          console.log(`  ${colors.green}✓${colors.reset} ${rule.description}`);
        } else {
          const severity = rule.severity || 'warning';
          this.results[severity].push({ category, ruleName, rule, message: result.message });
          
          const icon = severity === 'critical' ? '✗' : severity === 'warning' ? '⚠' : 'ℹ';
          const color = severity === 'critical' ? colors.red : severity === 'warning' ? colors.yellow : colors.blue;
          
          console.log(`  ${color}${icon}${colors.reset} ${rule.description}`);
          console.log(`    ${colors.dim}${result.message}${colors.reset}`);
        }
      }
      console.log('');
    }

    return { totalChecks, passedChecks };
  }

  generateReport() {
    const { critical, warning, info, passed } = this.results;
    
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
    
    const total = critical.length + warning.length + info.length + passed.length;
    const passRate = ((passed.length / total) * 100).toFixed(1);
    
    console.log(`Total Checks: ${total}`);
    console.log(`${colors.green}✓ Passed: ${passed.length} (${passRate}%)${colors.reset}`);
    
    if (critical.length > 0) {
      console.log(`${colors.red}✗ Critical: ${critical.length}${colors.reset}`);
    }
    if (warning.length > 0) {
      console.log(`${colors.yellow}⚠ Warnings: ${warning.length}${colors.reset}`);
    }
    if (info.length > 0) {
      console.log(`${colors.blue}ℹ Info: ${info.length}${colors.reset}`);
    }
    
    console.log('');
    
    // Overall status
    if (critical.length === 0 && warning.length === 0) {
      console.log(`${colors.green}✅ VALIDATION PASSED - Markup is valid!${colors.reset}\n`);
      return 'pass';
    } else if (critical.length === 0) {
      console.log(`${colors.yellow}⚠️  VALIDATION PASSED WITH WARNINGS${colors.reset}\n`);
      return 'pass-with-warnings';
    } else {
      console.log(`${colors.red}❌ VALIDATION FAILED - Critical issues found${colors.reset}\n`);
      return 'fail';
    }
  }

  saveReport(outputPath) {
    const lines = [];
    
    lines.push('# WaveMaker Markup Validation Report');
    lines.push('');
    lines.push(`**File:** ${this.markupPath}`);
    lines.push(`**Date:** ${new Date().toISOString()}`);
    lines.push('');
    lines.push('═'.repeat(80));
    lines.push('');
    
    const { critical, warning, info, passed } = this.results;
    const total = critical.length + warning.length + info.length + passed.length;
    const passRate = ((passed.length / total) * 100).toFixed(1);
    
    lines.push('## Summary');
    lines.push('');
    lines.push(`- Total Checks: ${total}`);
    lines.push(`- ✓ Passed: ${passed.length} (${passRate}%)`);
    lines.push(`- ✗ Critical: ${critical.length}`);
    lines.push(`- ⚠ Warnings: ${warning.length}`);
    lines.push(`- ℹ Info: ${info.length}`);
    lines.push('');
    
    if (critical.length > 0) {
      lines.push('## Critical Issues');
      lines.push('');
      critical.forEach(({ category, ruleName, rule, message }) => {
        lines.push(`### ${rule.description}`);
        lines.push(`**Category:** ${category}`);
        lines.push(`**Rule:** ${ruleName}`);
        lines.push(`**Issue:** ${message}`);
        lines.push('');
      });
    }
    
    if (warning.length > 0) {
      lines.push('## Warnings');
      lines.push('');
      warning.forEach(({ category, ruleName, rule, message }) => {
        lines.push(`### ${rule.description}`);
        lines.push(`**Category:** ${category}`);
        lines.push(`**Rule:** ${ruleName}`);
        lines.push(`**Issue:** ${message}`);
        lines.push('');
      });
    }
    
    if (info.length > 0) {
      lines.push('## Info');
      lines.push('');
      info.forEach(({ category, ruleName, rule, message }) => {
        lines.push(`### ${rule.description}`);
        lines.push(`**Category:** ${category}`);
        lines.push(`**Rule:** ${ruleName}`);
        lines.push(`**Issue:** ${message}`);
        lines.push('');
      });
    }
    
    lines.push('## Passed Checks');
    lines.push('');
    passed.forEach(({ category, rule }) => {
      lines.push(`- ✓ ${rule.description}`);
    });
    lines.push('');
    
    fs.writeFileSync(outputPath, lines.join('\n'));
    console.log(`${colors.green}📄 Report saved to: ${outputPath}${colors.reset}\n`);
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const markupPath = process.argv[2];
  
  if (!markupPath) {
    console.error(`${colors.red}Usage: node validate-markup.js <markup-file.xml>${colors.reset}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(markupPath)) {
    console.error(`${colors.red}Error: File not found: ${markupPath}${colors.reset}`);
    process.exit(1);
  }
  
  const validator = new MarkupValidator(markupPath);
  const { totalChecks, passedChecks } = validator.validate();
  const status = validator.generateReport();
  
  // Save report
  const reportPath = markupPath.replace(/\.xml$/, '-validation-report.md');
  validator.saveReport(reportPath);
  
  // Exit code based on status
  process.exit(status === 'fail' ? 1 : 0);
}

export { MarkupValidator };

