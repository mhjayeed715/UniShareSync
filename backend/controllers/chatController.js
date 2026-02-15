const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.chat = async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }
    
    console.log('Chat request received');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
          ...(messages || [])
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    const data = await response.json();
    console.log('Groq response status:', response.status);
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return res.status(500).json({ success: false, message: data.error.message || 'API error' });
    }
    
    if (data.choices && data.choices[0]) {
      res.json({ success: true, message: data.choices[0].message.content });
    } else {
      console.error('Invalid Groq response:', data);
      res.status(500).json({ success: false, message: 'Invalid response from AI' });
    }
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get response: ' + error.message });
  }
};
