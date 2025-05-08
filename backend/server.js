const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Setup
mongoose.connect('mongodb+srv://hemanthchiluka792:aSsdIwf7acjpzMxq@ai-journal.42okxga.mongodb.net/?retryWrites=true&w=majority&appName=AI-journal');

const MessageSchema = new mongoose.Schema({
  userId: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

// Gemini API Config
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyBVc4oFnf6ZX2vLG8yjycLXI8zAEAM000w'; // Replace with your actual key

app.post('/api/message', async (req, res) => {
    const { message } = req.body;
  
    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        }
      );
  
      const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (!reply) {
        console.error('Unexpected Gemini response:', geminiResponse.data);
        return res.status(500).json({ error: 'Invalid Gemini response structure' });
      }
  
      res.json({ reply });
    } catch (err) {
      console.error('Gemini API Error:', err.response?.data || err.message);
      res.status(500).json({ error: 'Gemini API failure', details: err.response?.data || err.message });
    }
  });
  

app.get('/api/history/:userId', async (req, res) => {
  const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
  res.json(messages);
});

app.listen(5000, () => console.log('Server running on port 5000'));