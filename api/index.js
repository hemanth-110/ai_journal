const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://<your-uri>', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const MessageSchema = new mongoose.Schema({
  userId: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

const GEMINI_API_KEY = 'your-api-key';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/message', async (req, res) => {
  const { userId, message } = req.body;

  const geminiResponse = await axios.post(GEMINI_API_URL, {
    contents: [{ role: 'user', parts: [{ text: message }] }]
  });

  const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  await Message.create({ userId, sender: 'user', message });
  await Message.create({ userId, sender: 'ai', message: reply });

  res.json({ reply });
});

app.get('/api/history/:userId', async (req, res) => {
  const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
  res.json(messages);
});

// Required for Vercel serverless function
module.exports = serverless(app);
