const express = require('express');
const { OpenAI } = require('openai');
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_MODEL?.includes('gemini') ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined,
});

router.post('/generate', async (req, res) => {
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
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    const endTime = Date.now();
    const aiResponseTime = endTime - startTime;

    const result = JSON.parse(response.choices[0].message.content);
    
    // Save to query_history
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

    // Activity Log
    await pool.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, ip_address)
       VALUES ($1, 'SQL Generated', $2, $3)`,
      [req.user.userId, prompt.substring(0, 200), req.ip]
    );

    result.historyId = historyRes.rows[0].id;
    res.json(result);
  } catch (err) {
    console.error('Error generating AI response:', err);
    res.status(500).json({ message: 'Error communicating with AI service' });
  }
});

module.exports = router;
