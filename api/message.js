const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://hemanthchiluka792:aSsdIwf7acjpzMxq@ai-journal.42okxga.mongodb.net/?retryWrites=true&w=majority&appName=AI-journal');

const MessageSchema = new mongoose.Schema({
  userId: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

const GEMINI_API_KEY = 'AIzaSyBVc4oFnf6ZX2vLG8yjycLXI8zAEAM000w';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// 👇 No `/api` prefix inside routes
app.post('/message', async (req, res) => {
  try {
    const { userId, message } = req.body;

    const geminiResponse = await axios.post(GEMINI_API_URL, {
      contents: [{ role: 'user', parts: [{ text: message }] }]
    });

    const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, something went wrong.';

    await Message.create({ userId, sender: 'user', message });
    await Message.create({ userId, sender: 'ai', message: reply });

    res.json({ reply });
  } catch (err) {
    console.error('Error in /message:', err.message);
    res.status(500).json({ error: 'Failed to process message.' });
  }
});

app.get('/history/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error in /history:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// ... all the same code above ...

const handler = serverless(app);
module.exports = app;
module.exports.handler = handler;
