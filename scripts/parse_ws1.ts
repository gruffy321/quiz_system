import * as fs from 'fs';
import * as path from 'path';

// Note: In a production batch system, this parser would be significantly more robust,
// utilizing LLM-assisted structuring or advanced heuristics. For this vertical slice,
// we are targeting the specific string patterns extracted by our win32com spike.

const rawPath = path.join(__dirname, '../src/data/raw/ws1_raw.txt');
const outDir = path.join(__dirname, '../src/data/modules/engineering');
const outPath = path.join(outDir, 'ws1.json');

function parseWS1() {
  if (!fs.existsSync(rawPath)) {
    console.error(`Raw file not found: ${rawPath}`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(rawPath, 'utf8');

  // Extract the drag and drop hazards from the brackets
  const hazardsMatch = rawText.match(/\[(.*?)\]/);
  let hazards: string[] = [];
  if (hazardsMatch) {
    hazards = hazardsMatch[1].split('–').map(s => s.trim()).filter(Boolean);
  }

  // Extract Task 2 prompt
  const task2Match = rawText.match(/Task 2: (.*?)\._{5,}/);
  let task2Prompt = "Explain why it is necessary to dispose of waste chemicals safely.";
  if (task2Match) {
    task2Prompt = task2Match[1] + '?';
  }

  // Construct the QuizModule adhering strictly to our schema
  const quizModule = {
    moduleId: "ws1",
    domain: "engineering",
    title: "Hazardous Substances Symbols",
    description: "Classification, Packaging and Labelling of Dangerous substances Regulations",
    questions: [
      {
        id: "q1_hazards",
        type: "drag_and_drop",
        prompt: "Complete the boxes with the correct hazards.",
        points: 9,
        draggables: hazards.map((h, i) => ({ id: `drag_${i}`, label: h })),
        dropZones: hazards.map((h, i) => ({ 
          id: `drop_${i}`, 
          expectedDraggableId: `drag_${i}`,
          imageUrl: `/assets/hazards/${h.toLowerCase().replace(/ /g, '_')}.svg`
        }))
      },
      {
        id: "q2_disposal",
        type: "fill_in_the_blank",
        prompt: task2Prompt,
        points: 5
      }
    ]
  };

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(quizModule, null, 2));
  console.log(`Successfully parsed and exported to: ${outPath}`);
}

parseWS1();
