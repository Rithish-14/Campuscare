const { GoogleGenerativeAI } = require('@google/generative-ai');

// Standard categories
const CATEGORIES = [
  'Hostel',
  'Classroom',
  'Laboratory',
  'Library',
  'Transport',
  'Canteen',
  'Water Supply',
  'Electricity',
  'Internet/Wi-Fi',
  'Sports',
  'Others'
];

// Offline keyword dictionary mapping for fallback
const KEYWORD_MAP = [
  {
    category: 'Internet/Wi-Fi',
    keywords: ['wifi', 'wi-fi', 'internet', 'network', 'router', 'connection', 'speed', 'slow', 'ethernet', 'lan', 'online', 'signal']
  },
  {
    category: 'Electricity',
    keywords: ['electricity', 'power', 'fan', 'light', 'bulb', 'socket', 'switch', 'breaker', 'short circuit', 'outage', 'ac', 'air condition', 'generator', 'fuse']
  },
  {
    category: 'Water Supply',
    keywords: ['water', 'leak', 'tap', 'drinking', 'cooler', 'sink', 'pipeline', 'clog', 'plumber', 'drain', 'overflow']
  },
  {
    category: 'Hostel',
    keywords: ['hostel', 'room', 'warden', 'mess', 'dorm', 'bed', 'bathroom', 'shower', 'geyser', 'roommate', 'wardrobe']
  },
  {
    category: 'Canteen',
    keywords: ['canteen', 'food', 'cafeteria', 'lunch', 'snack', 'hygiene', 'dirty food', 'plate', 'kitchen', 'menu']
  },
  {
    category: 'Classroom',
    keywords: ['classroom', 'desk', 'bench', 'whiteboard', 'projector', 'podium', 'lecture hall', 'marker', 'chalk', 'speaker']
  },
  {
    category: 'Laboratory',
    keywords: ['lab', 'laboratory', 'experiment', 'apparatus', 'chemicals', 'computer lab', 'pc', 'software', 'machine', 'microscope']
  },
  {
    category: 'Library',
    keywords: ['library', 'book', 'issue', 'journal', 'reading', 'fine', 'librarian', 'shelf', 'borrow', 'return']
  },
  {
    category: 'Transport',
    keywords: ['bus', 'transport', 'shuttle', 'route', 'driver', 'commute', 'parking', 'vehicle', 'fare']
  },
  {
    category: 'Sports',
    keywords: ['sports', 'ground', 'gym', 'court', 'racket', 'football', 'cricket', 'basketball', 'track', 'fitness', 'gear']
  }
];

// Local rule-based classifier
function classifyLocally(title, description) {
  const content = `${title} ${description}`.toLowerCase();
  
  // 1. Predict Category
  let bestCategory = 'Others';
  let maxMatches = 0;

  for (const item of KEYWORD_MAP) {
    let matches = 0;
    for (const kw of item.keywords) {
      // Look for whole-word or partial word matches
      const regex = new RegExp('\\b' + kw + '|' + kw + '\\b', 'g');
      const count = (content.match(regex) || []).length;
      matches += count;
    }

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = item.category;
    }
  }

  // 2. Predict Priority
  // High Priority Keywords
  const highKeywords = ['danger', 'shock', 'fire', 'spark', 'injur', 'hurt', 'short circuit', 'broken glass', 'theft', 'steal', 'emergency', 'flooding', 'current'];
  // Medium Priority Keywords
  const mediumKeywords = ['not working', 'broken', 'leak', 'failed', 'no power', 'no internet', 'rotten', 'spoiled', 'exam', 'exam room', 'missing', 'damaged'];

  let priority = 'LOW';
  
  const hasHigh = highKeywords.some(kw => content.includes(kw));
  const hasMedium = mediumKeywords.some(kw => content.includes(kw));

  if (hasHigh) {
    priority = 'HIGH';
  } else if (hasMedium) {
    priority = 'MEDIUM';
  }

  return {
    category: bestCategory,
    priority: priority,
    explanation: `Locally predicted based on keyword match score of ${maxMatches} and safety keywords scan.`
  };
}

// Gemini API classifier
async function classifyWithAI(title, description) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.log('No GEMINI_API_KEY found, using local classifier.');
    return classifyLocally(title, description);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI assistant for a college complaint and issue tracking system.
      Analyze the campus complaint details below and predict:
      1. The category. It MUST be exactly one of these: ${CATEGORIES.map(c => `"${c}"`).join(', ')}.
      2. The priority. It MUST be exactly one of these: "LOW", "MEDIUM", "HIGH".
      
      Choose priority based on:
      - HIGH: Immediate physical danger, active electrical shocks, structural safety, major water flooding, exams disrupted.
      - MEDIUM: Broken equipment, lack of standard services (no internet, no power, plumbing leak) that prevents day-to-day study but has no physical hazard.
      - LOW: Minor cosmetic issues, slow services, general feedback, library book suggestions.

      Complaint Details:
      Title: "${title}"
      Description: "${description}"

      Respond ONLY with a valid JSON object. Do not include markdown codeblocks or extra text. Format:
      {
        "category": "Predicted Category",
        "priority": "Predicted Priority",
        "explanation": "Brief explanation of classification"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean JSON response if model wrapped in markdown block
    if (text.startsWith('```json')) {
      text = text.substring(7, text.lastIndexOf('```')).trim();
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.lastIndexOf('```')).trim();
    }

    const parsed = JSON.parse(text);
    
    // Validate returned category and priority
    let category = CATEGORIES.includes(parsed.category) ? parsed.category : 'Others';
    let priority = ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.priority) ? parsed.priority : 'LOW';

    return {
      category,
      priority,
      explanation: parsed.explanation || 'Classified by Gemini AI.'
    };
  } catch (error) {
    console.error('Gemini AI API call failed, falling back to local:', error);
    return classifyLocally(title, description);
  }
}

module.exports = {
  classifyWithAI,
  classifyLocally
};
