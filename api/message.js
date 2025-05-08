const mongoose = require('mongoose');
const axios = require('axios');

const MessageSchema = new mongoose.Schema({
  userId: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const GEMINI_API_KEY = 'AIzaSyBVc4oFnf6ZX2vLG8yjycLXI8zAEAM000w';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function connectMongo() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb+srv://hemanthchiluka792:aSsdIwf7acjpzMxq@ai-journal.42okxga.mongodb.net/?retryWrites=true&w=majority&appName=AI-journal');
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, message } = req.body;

    await connectMongo();

    const geminiResponse = await axios.post(GEMINI_API_URL, {
      contents: [{ role: 'user', parts: [{ text: message }] }]
    });

    const reply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, something went wrong.';

    await Message.create({ userId, sender: 'user', message });
    await Message.create({ userId, sender: 'ai', message: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
