// Mock browser globals for Node.js test
global.URL = {
  createObjectURL: (blob: Blob) => `blob:${Math.random().toString(36).slice(2)}`,
  revokeObjectURL: () => {},
} as any;
(global as any).document = { createElement: () => ({ click: () => {}, href: '', download: '' }), body: { appendChild: () => {} } } as any;

import { parseLessonPlan, renderLessonPlanPDF, renderLessonPlanDOCX, renderLessonPlanPPTX } from './lessonPlanTemplate.js';
import { writeFileSync } from 'fs';

const content = `
# Year 8 Science: The Periodic Table
## Subject: Science
## Year Level: Year 8
## Duration: 50 minutes
## Date: 14 May 2026

## Learning Objectives
- Students will identify patterns in the periodic table
- Students will explain the difference between metals, non-metals and metalloids
- Students will predict the properties of elements based on their position

## Australian Curriculum Codes
- ACSSU152: Chemical reactions — explore different chemical reactions
- ACSSU153: Elements are made of atoms — arrangement of atoms

## Resources & Materials
- Whiteboard markers and erasers
- Sets of element cards (one set per group)
- Periodic table handouts (A3 size)
- Laptop/tablet for interactive periodic table simulation

## Lesson Steps

### Step 1: Introduction — Hook (5 minutes)
**Time:** 5 minutes
Teacher: Show a mystery element sample and ask students to predict its properties.

Students: Observe the sample, record initial predictions in their science journals.

### Step 2: Direct Instruction (10 minutes)
**Time:** 10 minutes
Teacher: Use the interactive whiteboard to demonstrate how the periodic table is organised.

Students: Take notes using the Cornell note-taking method.

### Step 3: Group Activity — Element Card Sort (15 minutes)
**Time:** 15 minutes
Teacher: Distribute element cards to groups of 4. Circulate and ask guiding questions.

Students: Sort element cards into groups based on shared properties.

## Assessment & Success Criteria
- Students can correctly identify at least 3 groups in the periodic table
- Exit ticket completed with at least one correct property of metals

## Differentiation
- **For EAL learners:** Provide a visual vocabulary wall with images for key terms.
- **For gifted learners:** Extension task — research superheavy elements.

## Teacher Notes
This lesson builds on prior knowledge of atoms and elements from Year 7.
`;

const plan = parseLessonPlan(content, 'Year 8 Science: The Periodic Table');
plan.schoolName = 'Westfield Secondary College';
plan.teacherName = 'Ms Thompson';

// Test PDF
const pdfBlob = await renderLessonPlanPDF(plan);
const pdfBuf = Buffer.from(await pdfBlob.arrayBuffer());
writeFileSync('/tmp/lesson-plan-template.pdf', pdfBuf);
console.log('PDF generated:', pdfBuf.length, 'bytes');

// Test DOCX
const docxBlob = await renderLessonPlanDOCX(plan);
const docxBuf = Buffer.from(await docxBlob.arrayBuffer());
writeFileSync('/tmp/lesson-plan-template.docx', docxBuf);
console.log('DOCX generated:', docxBuf.length, 'bytes');

// Test PPTX
const pptxBlob = await renderLessonPlanPPTX(plan);
const pptxBuf = Buffer.from(await pptxBlob.arrayBuffer());
writeFileSync('/tmp/lesson-plan-template.pptx', pptxBuf);
console.log('PPTX generated:', pptxBuf.length, 'bytes');

console.log('\nAll template outputs generated successfully');