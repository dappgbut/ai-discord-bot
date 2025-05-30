require('dotenv').config();
let chatHistory = [
  { role: 'system', content: 'You are a helpful assistant.' }
];

async function chatWithLLM(promptText) {
  const apiKey = process.env.AIAPIKEY;
  const apiUrl = 'https://llm.chutes.ai/v1/chat/completions'; 

  chatHistory.push({ role: 'user', content: promptText });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, 
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3-0324', 
        messages: chatHistory, 
        
      }),
    });

    if (!response.ok) {
      const errorData = await response.json(); 
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const llmResponseContent = data.choices[0].message.content;

    
    chatHistory.push({ role: 'assistant', content: llmResponseContent });

    console.log("LLM:", llmResponseContent);
    return llmResponseContent;

  } catch (error) {
    console.error('Error chatting with LLM:', error);
    chatHistory.pop();
    return null;
  }
}

module.exports = { chatWithLLM };