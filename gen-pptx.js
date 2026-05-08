
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';

const ACCENT = '8B4513';
const DARK = '1A1A2E';
const MID = '444444';
const LIGHT_BG = 'F8F4EF';

var steps = [
  { n: 1, label: 'Introduction — Hook', time: '5 min', desc: 'Teacher shows mystery element sample. Students observe and record predictions in science journals.' },
  { n: 2, label: 'Direct Instruction', time: '10 min', desc: 'Teacher demonstrates how the periodic table is organised. Students take Cornell notes.', teacher: 'Use interactive whiteboard to show groups and periods', student: 'Take notes using Cornell method. Highlight key vocabulary.' },
  { n: 3, label: 'Group Activity — Element Card Sort', time: '15 min', desc: 'Groups sort element cards into groups based on shared properties.', teacher: 'Distribute cards to groups of 4. Circulate and ask guiding questions.', student: 'Sort cards into groups. Justify sorting criteria using evidence.' },
  { n: 4, label: 'Plenary and Exit Ticket', time: '10 min', desc: 'Class discusses predictions. Students complete exit ticket.', teacher: 'Display three elements, ask students to predict their group.', student: 'Name two properties of metals and explain why they make good conductors.' },
];

// Title slide
var t1 = pptx.addSlide();
t1.background = { color: DARK };
t1.addText('Year 8 Science', { x: 0.5, y: 1.8, w: '90%', h: 0.8, fontSize: 28, color: 'AAAAAA', align: 'center' });
t1.addText('The Periodic Table', { x: 0.5, y: 2.5, w: '90%', h: 1.2, fontSize: 44, bold: true, color: 'FFFFFF', align: 'center' });
t1.addText('Science  |  Year 8  |  50 min', { x: 0.5, y: 4.0, w: '90%', h: 0.5, fontSize: 20, color: 'AAAAAA', align: 'center' });
t1.addText('Created with Owlly', { x: 0.5, y: 7.2, w: '90%', h: 0.3, fontSize: 12, color: '555555', align: 'center' });

// Overview slide
var t2 = pptx.addSlide();
t2.background = { color: LIGHT_BG };
t2.addText('Lesson Overview', { x: 0.4, y: 0.3, w: '95%', h: 0.7, fontSize: 28, bold: true, color: ACCENT });
t2.addShape('rect', { x: 0.4, y: 1.0, w: 2.5, h: 0.04, fill: { color: ACCENT } });
t2.addText('Subject: Science  |  Year Level: Year 8  |  Duration: 50 min  |  Date: 14 May 2026', { x: 0.5, y: 1.2, w: '90%', h: 0.5, fontSize: 16, color: MID });
t2.addText('Learning Objectives', { x: 0.4, y: 2.0, w: '90%', h: 0.4, fontSize: 14, bold: true, color: ACCENT });
t2.addText([
  { text: 'Students will identify patterns in the periodic table', options: { bullet: true, breakLine: true } },
  { text: 'Students will explain the difference between metals, non-metals and metalloids', options: { bullet: true, breakLine: true } },
  { text: 'Students will predict the properties of elements based on their position', options: { bullet: true } },
], { x: 0.5, y: 2.4, w: '90%', h: 2.5, fontSize: 14, color: MID });

// Step slides
steps.forEach(function(s) {
  var slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.7, fill: { color: ACCENT } });
  slide.addText('Step ' + s.n + ': ' + s.label, { x: 0.4, y: 0.15, w: '95%', h: 0.4, fontSize: 22, bold: true, color: 'FFFFFF' });
  slide.addText(s.time, { x: 0.4, y: 0.85, w: '90%', h: 0.3, fontSize: 13, color: '888888', italic: true });
  slide.addText(s.desc, { x: 0.4, y: 1.3, w: '90%', h: 1.2, fontSize: 15, color: DARK });
  var sy = 2.7;
  if (s.teacher) {
    slide.addText('Teacher Actions', { x: 0.4, y: sy, w: '90%', h: 0.3, fontSize: 12, bold: true, color: ACCENT });
    sy += 0.35;
    slide.addText(s.teacher, { x: 0.5, y: sy, w: '90%', h: 0.5, fontSize: 12, color: MID });
    sy += 0.6;
  }
  if (s.student) {
    slide.addText('Student Activities', { x: 0.4, y: sy, w: '90%', h: 0.3, fontSize: 12, bold: true, color: ACCENT });
    sy += 0.35;
    slide.addText(s.student, { x: 0.5, y: sy, w: '90%', h: 0.5, fontSize: 12, color: MID });
  }
});

var buf = pptx.write({});
buf.then(function(b) {
  require('fs').writeFileSync('/tmp/lesson-plan-template.pptx', Buffer.from(b));
  console.log('PPTX generated:', b.length, 'bytes');
}).catch(function(e) { console.error(e); process.exit(1); });
