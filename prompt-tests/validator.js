#!/usr/bin/env node

/**
 * Simple Validator for WaveMaker ReAct Agent
 * 
 * Compares agent's actual output against ground truth expected data.
 * No complex parsing - just straightforward JSON comparison.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

/**
 * Validate agent output against expected ground truth
 */
function validate(expectedPath, actualPath) {
  console.log(`\n${colors.cyan}🔍 Validating Agent Response${colors.reset}\n`);
  
  const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
  const actual = JSON.parse(fs.readFileSync(actualPath, 'utf-8'));
  
  let totalScore = 0;
  const maxScore = 100;
  const results = {
    toolSelection: { score: 0, max: expected.scoring.toolSelection, issues: [] },
    dataAccuracy: { score: 0, max: expected.scoring.dataAccuracy, issues: [] },
    completeness: { score: 0, max: expected.scoring.completeness, issues: [] },
    answerQuality: { score: 0, max: expected.scoring.answerQuality, issues: [] },
    contextManagement: { score: 0, max: expected.scoring.contextManagement, issues: [] },
  };
  
  // 1. TOOL SELECTION (20 points)
  console.log(`${colors.blue}1. Tool Selection${colors.reset}`);
  validateToolSelection(expected, actual, results.toolSelection);
  
  // 2. DATA ACCURACY (30 points)
  console.log(`${colors.blue}2. Data Accuracy${colors.reset}`);
  validateDataAccuracy(expected, actual, results.dataAccuracy);
  
  // 3. COMPLETENESS (25 points)
  console.log(`${colors.blue}3. Completeness${colors.reset}`);
  validateCompleteness(expected, actual, results.completeness);
  
  // 4. ANSWER QUALITY (15 points)
  console.log(`${colors.blue}4. Answer Quality${colors.reset}`);
  validateAnswerQuality(expected, actual, results.answerQuality);
  
  // 5. CONTEXT MANAGEMENT (10 points)
  console.log(`${colors.blue}5. Context Management${colors.reset}`);
  validateContextManagement(expected, actual, results.contextManagement);
  
  // Calculate total
  Object.values(results).forEach(category => {
    totalScore += category.score;
  });
  
  // Print results
  printResults(expected.testId, totalScore, maxScore, results);
  
  return {
    passed: totalScore >= 75,
    score: totalScore,
    maxScore,
    results,
  };
}

function validateToolSelection(expected, actual, result) {
  const maxPoints = result.max;
  let score = maxPoints;
  
  // Check if required tools were called
  const actualTools = (actual.toolCalls || []).map(t => t.tool);
  const requiredTools = expected.expectedBehavior.toolSequence.map(t => t.tool);
  
  requiredTools.forEach((tool, index) => {
    if (!actualTools.includes(tool)) {
      score -= 10;
      result.issues.push(`❌ Missing required tool: ${tool}`);
    } else {
      console.log(`  ✅ Tool called: ${tool}`);
    }
  });
  
  // Check tool sequence
  const correctSequence = requiredTools.every((tool, i) => actualTools[i] === tool);
  if (!correctSequence && actualTools.length > 0) {
    score -= 5;
    result.issues.push(`⚠️  Tools called in different order`);
  }
  
  result.score = Math.max(0, score);
}

function validateDataAccuracy(expected, actual, result) {
  const maxPoints = result.max;
  let score = maxPoints;
  const groundTruth = expected.groundTruth;
  
  // Check props documented
  const documented = actual.answer?.propsDocumented || [];
  const missing = groundTruth.props.list.filter(p => !documented.includes(p));
  
  if (missing.length > 0) {
    const penalty = Math.min(missing.length * 2, 15);
    score -= penalty;
    result.issues.push(`❌ Missing ${missing.length} props: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}`);
  } else {
    console.log(`  ✅ All ${groundTruth.props.total} props documented`);
  }
  
  // Check events
  const eventsDoc = actual.answer?.eventsDocumented || [];
  const missingEvents = groundTruth.events.list.map(e => e.name).filter(e => !eventsDoc.includes(e));
  
  if (missingEvents.length > 0) {
    score -= 5;
    result.issues.push(`❌ Missing events: ${missingEvents.join(', ')}`);
  } else {
    console.log(`  ✅ All ${groundTruth.events.total} events documented`);
  }
  
  // Check style classes
  const stylesDoc = actual.answer?.styleClassesDocumented || [];
  const missingStyles = expected.expectedAnswer.mustDocument.keyStyleClasses.filter(s => !stylesDoc.includes(s));
  
  if (missingStyles.length > 0) {
    score -= 5;
    result.issues.push(`⚠️  Missing key style classes: ${missingStyles.join(', ')}`);
  } else {
    console.log(`  ✅ Key style classes documented`);
  }
  
  // Check for hallucinations (props that don't exist)
  const hallucinated = documented.filter(p => !groundTruth.props.list.includes(p) && p !== 'name');
  if (hallucinated.length > 0) {
    score -= 10;
    result.issues.push(`❌ HALLUCINATION: Documented non-existent props: ${hallucinated.join(', ')}`);
  }
  
  result.score = Math.max(0, score);
}

function validateCompleteness(expected, actual, result) {
  const maxPoints = result.max;
  let score = maxPoints;
  const mustHave = expected.expectedAnswer.mustHave;
  
  // Check structural elements
  if (!actual.answer?.hasPropsTable && mustHave.propsTable) {
    score -= 8;
    result.issues.push(`❌ Missing props table`);
  } else {
    console.log(`  ✅ Props table present`);
  }
  
  if (!actual.answer?.hasEventsSection && mustHave.eventsSection) {
    score -= 5;
    result.issues.push(`❌ Missing events section`);
  } else {
    console.log(`  ✅ Events section present`);
  }
  
  if (!actual.answer?.hasStyleSection && mustHave.styleClassesSection) {
    score -= 5;
    result.issues.push(`⚠️  Missing style section`);
  } else {
    console.log(`  ✅ Style section present`);
  }
  
  // Check examples
  const exampleCount = actual.answer?.codeExamples || 0;
  if (exampleCount < mustHave.usageExamples) {
    score -= 4;
    result.issues.push(`⚠️  Expected ${mustHave.usageExamples} examples, got ${exampleCount}`);
  } else {
    console.log(`  ✅ ${exampleCount} code examples provided`);
  }
  
  // Check evidence trail
  if (!actual.answer?.hasEvidenceTrail && mustHave.evidenceTrail) {
    score -= 3;
    result.issues.push(`⚠️  Missing evidence trail`);
  } else {
    console.log(`  ✅ Evidence trail present`);
  }
  
  result.score = Math.max(0, score);
}

function validateAnswerQuality(expected, actual, result) {
  const maxPoints = result.max;
  let score = maxPoints;
  
  // Check if answer is actionable
  if (!actual.answer?.isActionable) {
    score -= 5;
    result.issues.push(`⚠️  Answer may not be actionable`);
  } else {
    console.log(`  ✅ Answer is actionable`);
  }
  
  // Check if examples are complete
  if (actual.answer?.codeExamples > 0 && !actual.answer?.examplesRunnable) {
    score -= 5;
    result.issues.push(`⚠️  Code examples may be incomplete`);
  } else if (actual.answer?.codeExamples > 0) {
    console.log(`  ✅ Code examples are runnable`);
  }
  
  // Check for clear structure
  const sections = actual.answer?.sections || 0;
  if (sections < expected.expectedAnswer.mustHave.styleClassesSection ? 4 : 3) {
    score -= 5;
    result.issues.push(`⚠️  Answer lacks clear structure`);
  } else {
    console.log(`  ✅ Well-structured answer (${sections} sections)`);
  }
  
  result.score = Math.max(0, score);
}

function validateContextManagement(expected, actual, result) {
  const maxPoints = result.max;
  let score = maxPoints;
  
  const mustTrack = expected.expectedBehavior.workingMemory.mustTrack;
  const actualSession = Object.keys(actual.workingMemory?.session || {});
  const actualTask = Object.keys(actual.workingMemory?.task || {});
  
  // Check session context
  const missingSession = mustTrack.session.filter(k => !actualSession.includes(k));
  if (missingSession.length > 0) {
    score -= 3;
    result.issues.push(`⚠️  Missing session context: ${missingSession.join(', ')}`);
  } else {
    console.log(`  ✅ Session context tracked`);
  }
  
  // Check task context
  const missingTask = mustTrack.task.filter(k => !actualTask.includes(k));
  if (missingTask.length > 0) {
    score -= 3;
    result.issues.push(`⚠️  Missing task context: ${missingTask.join(', ')}`);
  } else {
    console.log(`  ✅ Task context tracked`);
  }
  
  // Check decisions
  const decisions = actual.decisions || [];
  const mustHave = expected.expectedBehavior.decisions.mustHave;
  const missingDecisions = mustHave.filter(d => !decisions.includes(d));
  
  if (missingDecisions.length > 0) {
    score -= 4;
    result.issues.push(`⚠️  Missing decisions: ${missingDecisions.join(', ')}`);
  } else {
    console.log(`  ✅ Correct decision flow`);
  }
  
  result.score = Math.max(0, score);
}

function printResults(testId, totalScore, maxScore, results) {
  const passed = totalScore >= 75;
  const statusIcon = passed ? '✅' : '❌';
  const statusColor = passed ? colors.green : colors.red;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${statusColor}${statusIcon} Test ${testId}: ${totalScore}/${maxScore} points${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Category breakdown
  console.log(`${colors.cyan}Category Breakdown:${colors.reset}\n`);
  Object.entries(results).forEach(([category, data]) => {
    const percentage = ((data.score / data.max) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(`  ${category.padEnd(20)} ${bar} ${data.score}/${data.max}`);
  });
  
  // Issues
  const allIssues = Object.values(results).flatMap(r => r.issues);
  if (allIssues.length > 0) {
    console.log(`\n${colors.yellow}Issues Found:${colors.reset}\n`);
    allIssues.forEach(issue => console.log(`  ${issue}`));
  }
  
  console.log('');
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
${colors.cyan}WaveMaker ReAct Agent Validator${colors.reset}

Usage:
  node validator.js <expected.json> <actual.json>

Example:
  node validator.js expected/1.1-button-widget.json actual/1.1-run.json
    `);
    process.exit(1);
  }
  
  const expectedPath = path.resolve(args[0]);
  const actualPath = path.resolve(args[1]);
  
  if (!fs.existsSync(expectedPath)) {
    console.error(`${colors.red}Expected file not found: ${expectedPath}${colors.reset}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(actualPath)) {
    console.error(`${colors.red}Actual file not found: ${actualPath}${colors.reset}`);
    process.exit(1);
  }
  
  const result = validate(expectedPath, actualPath);
  process.exit(result.passed ? 0 : 1);
}

export { validate };

