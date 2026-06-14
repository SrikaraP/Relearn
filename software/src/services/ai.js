import { GoogleGenerativeAI } from "@google/generative-ai";

let diagnosticSubscribers = [];
export const aiDiagnostics = {
  keyExists: false,
  sdkInitialized: false,
  lastSuccessfulCall: null,
  lastError: null,
  requestCount: 0
};

const notifyDiagnostics = () => {
  diagnosticSubscribers.forEach(cb => cb({ ...aiDiagnostics }));
};

export const subscribeToDiagnostics = (callback) => {
  diagnosticSubscribers.push(callback);
  callback({ ...aiDiagnostics }); 
  return () => {
    diagnosticSubscribers = diagnosticSubscribers.filter(cb => cb !== callback);
  };
};

const updateDiagnostics = (updates) => {
  Object.assign(aiDiagnostics, updates);
  notifyDiagnostics();
};

const getApiKey = () => {
  const key = localStorage.getItem('relearn_gemini_key') || 'AQ.Ab8RN6IMk2v3fCui3urJkY87poz0Uk67Dm0fCkzhdzQ3WDFS0A';
  updateDiagnostics({ keyExists: !!key });
  return key;
};

const getModel = (modelName = "gemini-2.5-flash") => {
  const apiKey = getApiKey();
  if (!apiKey) {
    updateDiagnostics({ lastError: "API_KEY_MISSING", sdkInitialized: false });
    throw new Error("API_KEY_MISSING");
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    updateDiagnostics({ sdkInitialized: true });
    return model;
  } catch (err) {
    updateDiagnostics({ sdkInitialized: false, lastError: `SDK Init Error: ${err.message}` });
    throw err;
  }
};

export const testGeminiConnection = async () => {
  updateDiagnostics({ requestCount: aiDiagnostics.requestCount + 1, lastError: null });
  try {
    const model = getModel("gemini-2.5-flash");
    const result = await model.generateContent("Reply exactly with the word CONNECTED");
    const text = result.response.text();
    updateDiagnostics({ lastSuccessfulCall: new Date().toISOString(), lastError: null });
    return { success: true, text, modelUsed: "gemini-2.5-flash" };
  } catch (err) {
    const errorMsg = err.message || JSON.stringify(err);
    console.error("[Gemini Connection Error]", err);
    updateDiagnostics({ lastError: `Connection Failed: ${errorMsg}` });
    throw new Error(errorMsg);
  }
};

const generateJSON = async (systemPrompt, userPrompt) => {
  updateDiagnostics({ requestCount: aiDiagnostics.requestCount + 1 });
  try {
    const model = getModel();
    const prompt = `${systemPrompt}\n\nCRITICAL: Return ONLY valid JSON. No markdown wrappers, no \`\`\`json, no preamble.\n\nUser Context/Request:\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    updateDiagnostics({ lastSuccessfulCall: new Date().toISOString(), lastError: null });
    
    let cleanJSON = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (err) {
    const errorMsg = err.message || JSON.stringify(err);
    console.error("[Gemini GenerateJSON Error]", err);
    updateDiagnostics({ lastError: `JSON Parse/Generate Error: ${errorMsg}` });
    throw new Error(errorMsg);
  }
};

// ==========================================
// MULTIMODAL EXTRACTION
// ==========================================

export const extractTextWithGemini = async (base64Data, mimeType) => {
  updateDiagnostics({ requestCount: aiDiagnostics.requestCount + 1 });
  try {
    const model = getModel("gemini-2.5-flash");
    const prompt = `Extract all text, equations, and tables from this document/image exactly as written. 
CRITICAL RULES:
1. Preserve formatting (markdown headers, bullet points).
2. DO NOT include conversational filler (e.g. "Here is the text", "The document contains").
3. DO NOT describe the document visually unless it's a diagram that requires transcription.
4. ONLY return the raw study content.`;
    
    const imagePart = {
      inlineData: {
        data: base64Data.split(',')[1],
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    updateDiagnostics({ lastSuccessfulCall: new Date().toISOString(), lastError: null });
    return result.response.text();
  } catch (err) {
    const errorMsg = err.message || JSON.stringify(err);
    console.error("[Gemini Extraction Error]", err);
    updateDiagnostics({ lastError: `Extraction Error: ${errorMsg}` });
    throw new Error(errorMsg);
  }
};

// ==========================================
// 9 EXPLICIT AI ACTIONS (STRICT JSON SCHEMA)
// ==========================================

export const generateSummary = (text) => {
  const sys = `You are an expert tutor. Summarize the text. 
Format EXACTLY as this JSON object:
{
  "conciseSummary": "A very brief 2-3 sentence overview.",
  "takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "keyTerms": ["Term 1", "Term 2"],
  "formulas": [{"name": "Formula Name", "equation": "x = y + z"}]
}`;
  return generateJSON(sys, text);
};

export const generateRevisionPlan = (text) => {
  const sys = `Create a step-by-step revision plan.
Format EXACTLY as this JSON object:
{
  "title": "Revision Timeline",
  "tasks": [
    { "id": 1, "task": "Review Core Concepts", "timeEstimate": "30m", "completed": false },
    { "id": 2, "task": "Practice Problems", "timeEstimate": "45m", "completed": false }
  ]
}`;
  return generateJSON(sys, text);
};

export const analyzeDocument = (text) => {
  const sys = `Analyze this document.
Format EXACTLY as this JSON object:
{
  "subject": "e.g., Physics",
  "difficulty": "Beginner | Intermediate | Advanced",
  "coreThemes": ["Theme 1", "Theme 2"],
  "potentialGaps": ["Area that might need more context"]
}`;
  return generateJSON(sys, text);
};

export const extractKeyConcepts = (text) => {
  const sys = `Extract the top 5-10 key concepts.
Format EXACTLY as this JSON object:
{
  "concepts": [
    { "concept": "Name", "definition": "Clear concise definition" }
  ]
}`;
  return generateJSON(sys, text);
};

export const generateStudyGuide = (text) => {
  const sys = `Create a comprehensive Study Guide.
Format EXACTLY as this JSON object:
{
  "title": "Study Guide",
  "outline": [
    { "section": "Topic 1", "bullets": ["Point A", "Point B"] }
  ]
}`;
  return generateJSON(sys, text);
};

export const generateExplanations = (text) => {
  const sys = `Break down the most complex parts.
Format EXACTLY as this JSON object:
{
  "breakdowns": [
    {
      "concept": "Name of complex concept",
      "definition": "Simple definition",
      "rules": ["Rule 1", "Rule 2"],
      "example": "A real world analogy or example",
      "mistakes": "Common pitfall to avoid"
    }
  ]
}`;
  return generateJSON(sys, text);
};

export const generateFlashcards = (text) => {
  const sys = `Extract concepts into flashcards. 
Format EXACTLY as this JSON array:
[{"id": "id1", "q": "Question?", "a": "Answer"}]`;
  return generateJSON(sys, text);
};

export const generateQuiz = (text) => {
  const sys = `Create a 4-question multiple choice quiz. 
Format EXACTLY as this JSON array:
[{"id": "q1", "q": "Question?", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Why A is correct"}]`;
  return generateJSON(sys, text);
};

export const generateExamQuestions = (text) => {
  const sys = `Create 3 long-form/essay style exam questions.
Format EXACTLY as this JSON array:
[{"id": "eq1", "q": "Exam Question?", "rubric": ["Must mention X", "Must explain Y"]}]`;
  return generateJSON(sys, text);
};

// ==========================================
// ADAPTIVE SKILL TREE & CHAT
// ==========================================

export const generateInitialSkillTree = (profile) => {
  const sys = `You are a dynamic education engine. Generate an initial skill tree.
Format exactly as a JSON array of nodes:
[
  { 
    "id": "node_1", 
    "title": "Master Python Basics", 
    "desc": "Complete variables and loops.", 
    "status": "active",
    "category": "Academics"
  },
  {
    "id": "node_2",
    "title": "Build First CLI Tool",
    "desc": "Create a calculator app.",
    "status": "locked",
    "category": "Projects",
    "dependsOn": ["node_1"]
  }
]
Generate 6-8 nodes.`;
  return generateJSON(sys, JSON.stringify(profile));
};

export const evolveSkillTree = (currentTree, actionContext, profile) => {
  const sys = `The student completed an action: "${actionContext}".
Update their skill tree.
1. Mark completed nodes as "completed".
2. Change "locked" to "active" if dependencies are met.
3. Add 1-2 new related nodes.
Return ENTIRE JSON array.`;
  const prompt = `Context: ${actionContext}\nCurrent: ${JSON.stringify(currentTree)}\nProfile: ${JSON.stringify(profile)}`;
  return generateJSON(sys, prompt);
};

export const chatWithCoach = async (chatHistory, newQuestion, context = "") => {
  updateDiagnostics({ requestCount: aiDiagnostics.requestCount + 1 });
  try {
    const model = getModel();
    let prompt = "You are an AI Education Coach.\n";
    if (context) prompt += `Context: ${context}\n`;
    
    const recent = chatHistory.slice(-4);
    prompt += recent.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    prompt += `\nUSER: ${newQuestion}\nCOACH:`;
    
    const result = await model.generateContent(prompt);
    updateDiagnostics({ lastSuccessfulCall: new Date().toISOString(), lastError: null });
    return result.response.text();
  } catch (err) {
    console.error("[Gemini Chat Error]", err);
    throw err;
  }
};

export const generateOpportunities = (profile) => {
  const sys = `Recommend 3 specific real-world opportunities.
Format exactly as a JSON array: [{"title": "Name", "desc": "Details", "type": "Match" | "Challenging"}]`;
  return generateJSON(sys, JSON.stringify(profile));
};

// ==========================================
// TEACHER AI ENGINE
// ==========================================

export const analyzeAssessment = async (qpBase64, qpMime, asBase64, asMime) => {
  updateDiagnostics({ requestCount: aiDiagnostics.requestCount + 1 });
  try {
    const model = getModel("gemini-2.5-flash");
    const prompt = `You are an expert Teacher and Grader. 
Image 1 is the Question Paper (or Syllabus). Image 2 is the Student's Answer Sheet.
Analyze both and provide a highly detailed structured assessment.
CRITICAL: Return ONLY valid JSON. No markdown wrappers.
Format exactly as this JSON object:
{
  "overallScore": "Score/Total",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "improvementAreas": ["Improvement 1", "Improvement 2"],
  "questions": [
    {
      "qNum": "1",
      "studentAnswer": "Summary of their answer",
      "mistake": "Explanation of mistake if any, else 'None'",
      "correctApproach": "How to solve it properly",
      "status": "Correct | Incorrect | Partial"
    }
  ]
}`;
    
    const parts = [prompt];
    
    if (qpBase64) {
       parts.push({ inlineData: { data: qpBase64.split(',')[1], mimeType: qpMime } });
    }
    if (asBase64) {
       parts.push({ inlineData: { data: asBase64.split(',')[1], mimeType: asMime } });
    }

    const result = await model.generateContent(parts);
    updateDiagnostics({ lastSuccessfulCall: new Date().toISOString(), lastError: null });
    
    let text = result.response.text();
    let cleanJSON = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJSON);
  } catch (err) {
    const errorMsg = err.message || JSON.stringify(err);
    console.error("[Gemini Assessment Analyzer Error]", err);
    updateDiagnostics({ lastError: `Assessment Analyzer Error: ${errorMsg}` });
    throw new Error(errorMsg);
  }
};

export const generateTeacherContent = (requestType, context) => {
  const sys = `You are an expert Teacher AI. The teacher wants you to generate a: ${requestType}.
Context provided: ${context}
Return ONLY valid JSON. No markdown.
Format exactly as this JSON object:
{
  "title": "Generated Title",
  "content": "Rich markdown content of the generated material",
  "tags": ["Tag1", "Tag2"]
}`;
  return generateJSON(sys, context);
};
