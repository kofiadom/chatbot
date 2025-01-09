import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatActive, setIsChatActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!conversationId) {
      setConversationId(Date.now().toString());
    }
  }, [conversationId]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (message.trim() === '') return;

    setLoading(true);
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'user', text: message },
    ]);

    try {
      const response = await fetch(`http://localhost:8000/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error with API request');
      }

      const data = await response.json();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: data.response },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} fixed inset-0 flex justify-center items-center p-4`}>
      <div className={`w-full max-w-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 sm:p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-2xl font-semibold`}>AI Chatbot</h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} transition-colors`}
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>

        <div
          ref={chatContainerRef}
          className={`overflow-y-auto h-96 space-y-4 mb-4 p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'user' ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900')}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={`max-w-xs p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} animate-pulse`}>
                <span className="typing-indicator">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {isChatActive && (
          <form onSubmit={sendMessage} className ="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`flex-1 p-2 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className={`ml-2 p-2 rounded-lg ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} hover:${isDarkMode ? 'bg-blue-500' : 'bg-blue-400'} transition-colors`}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default App;