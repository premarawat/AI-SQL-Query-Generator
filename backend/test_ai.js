require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json'
  }
});

model.generateContent('Return { "test": "ok" }')
  .then(r => console.log('SUCCESS:', r.response.text()))
  .catch(e => console.error('ERROR:', e.message));