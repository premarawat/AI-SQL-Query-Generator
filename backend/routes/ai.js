const express = require('express');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/generate', async (req, res) => {
  console.log("========== AI ROUTE HIT ==========");
  console.log("Request Body:", req.body);

  const { prompt, currentSchema } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    const systemMessage = `
You are an expert SQL assistant. Your job is to analyze the user's prompt and current database schema, and generate SQL queries.
Return the response as a valid JSON object EXACTLY matching this structure:
{
  "requirement": "The original user prompt or a slightly clarified version",
  "intent": "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "CREATE" | "ALTER" | "DROP",
  "tables": ["Table1", "Table2"],
  "attributes": "Column1, Column2",
  "explanation": "A plain English explanation of what the query does",
  "estRows": "e.g. ~10, or 0 (DDL)",
  "riskLevel": "Safe" | "Moderate" | "High Risk",
  "schemaDefinition": { "name": "TableName", "columns": [{ "name": "Col", "type": "INT", "isPk": true, "isFk": false }] }, // Include ONLY if intent is CREATE
  "options": [
    { "title": "Option 1", "sql": "SQL_QUERY_HERE" },
    { "title": "Option 2 (Alternative)", "sql": "SQL_QUERY_HERE" }
  ]
}

Current Schema: ${JSON.stringify(currentSchema || [])}
`;

    const startTime = Date.now();
    let resultText = '';
    console.log("GEMINI_API_KEY =", process.env.GEMINI_API_KEY);
    console.log("OPENAI_API_KEY =", process.env.OPENAI_API_KEY);
    if (process.env.GEMINI_API_KEY) {
      console.log("Using Gemini API");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const fullPrompt = systemMessage + "\n\nUser Prompt: " + prompt;
     let response;

for (let attempt = 1; attempt <= 2; attempt++) {
  try {
    response = await model.generateContent(fullPrompt);
    break;
  } catch (error) {
    if (error.status === 503 && attempt < 2) {
      console.log("Gemini busy. Retrying...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      throw error;
    }
  }
}

console.log("Gemini responded successfully");

resultText = response.response.text();

      console.log("===== RAW GEMINI RESPONSE =====");
      console.log(resultText);
    } else {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });
      resultText = response.choices[0].message.content;
    }

    const endTime = Date.now();
    const aiResponseTime = endTime - startTime;

    // Clean up potential markdown formatting (```json ... ```)
    let cleanedText = resultText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }
    let result;

try {
  result = JSON.parse(cleanedText);
} catch (jsonError) {
  console.error("Invalid JSON returned by AI");
  console.error(cleanedText);

  return res.status(500).json({
    message: "AI returned an invalid response.",
    raw: cleanedText
  });
}

    console.log("===== JSON PARSED SUCCESSFULLY =====");
    console.log(result);
    result.tables = result.tables || [];
result.attributes = result.attributes || "";
result.options = result.options || [];
result.riskLevel = result.riskLevel || "Safe";
result.intent = result.intent || "SELECT";
result.explanation = result.explanation || "";
result.requirement = result.requirement || prompt;

    // Save to query_history
    console.log("===== INSERTING INTO query_history =====");
 let historyId = null;

try {
  const historyRes = await pool.query(
      `INSERT INTO query_history (
        user_id, prompt, generated_sql, explanation, query_type, tables_used, columns_used, 
        validation_status, optimization_suggestions, estimated_rows_returned, 
        estimated_rows_affected, risk_level, ai_response_time_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id`,
      [
        req.user.userId,
        prompt,
        result.options?.[0]?.sql || result.sql || '',
        result.explanation || '',
        result.intent || 'SELECT',
        JSON.stringify(result.tables || []),
        JSON.stringify(result.attributes ? result.attributes.split(',') : []),
        'Pending', // validation_status
        '', // optimization_suggestions
        parseInt(result.estRows) || 0,
        result.intent === 'SELECT' ? 0 : (parseInt(result.estRows) || 0),
        result.riskLevel || 'Safe',
        aiResponseTime
      ]
    );

  historyId = historyRes.rows[0].id;

  await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES ($1, 'SQL Generated', $2, $3)`,
      [req.user.userId, prompt.substring(0, 200), req.ip]
    ); 
} catch (dbError) {
  console.error("History save failed:", dbError.message);
}

   result.historyId = historyId;
    console.log("===== SENDING RESPONSE TO FRONTEND =====");
    res.json(result);
  } catch (err) {
    console.error("========== AI ERROR ==========");
    console.error(err);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    if (err.response) {
      console.error("Response:", err.response.data);
    }

    if (err.code) {
      console.error("Code:", err.code);
    }
if (err.status === 503) {
  return res.status(503).json({
    message: "Gemini server is currently busy. Please try again in a few seconds."
  });
}

if (err.status === 429) {
  return res.status(429).json({
    message: "Gemini API quota exceeded."
  });
}

return res.status(500).json({
  message: err.message || "Internal Server Error"
});
  }
});

module.exports = router;
