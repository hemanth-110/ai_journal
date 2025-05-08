import React, { useState, useEffect } from 'react';
import axios from 'axios';

const userId = 'user123';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/history/${userId}`).then(res => {
      setMessages(res.data);
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', message: input };
    setMessages(prev => [...prev, userMessage]);

    const res = await axios.post('http://localhost:5000/api/message', {
      userId,
      message: input,
    });

    setMessages(prev => [...prev, userMessage, { sender: 'ai', message: res.data.reply }]);
    setInput('');
  };

  return (
    <div className="h-screen flex">
      <div className="w-1/3 bg-gray-100 p-4">
        <h2 className="text-xl font-bold">Journal Assistant</h2>
        {/* <p className="text-sm text-gray-600">Options:</p>
        <ul className="mt-2 space-y-2">
          {['Summarize my day', 'Give me motivation for tomorrow', 'What can I improve this week?'].map(prompt => (
            <li key={prompt}>
              <button onClick={() => setInput(prompt)} className="text-blue-600 underline">
                {prompt}
              </button>
            </li>
          ))}
        </ul> */}
      </div>
      <div className="w-2/3 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                {msg.message}
              </span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border px-4 py-2 rounded-lg"
            placeholder="Write about your day..."
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
