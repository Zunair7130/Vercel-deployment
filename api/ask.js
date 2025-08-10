export default async function handler(req, res) {
  // Simplified CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const userMessage = req.body?.message;

  // Debug logs
  console.log('🔧 Debug Info:');
  console.log('- Method:', req.method);
  console.log('- Body exists:', !!req.body);
  console.log('- Message:', userMessage);
  console.log('- API Key exists:', !!process.env.DEEPSEEK_API_KEY);
  console.log('- API Key prefix:', process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.substring(0, 10) + '...' : 'MISSING');

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY missing from environment variables');
    return res.status(500).json({ 
      error: "API key not configured",
      debug: "Environment variable DEEPSEEK_API_KEY is missing"
    });
  }

  const postData = JSON.stringify({
    model: "deepseek/deepseek-chat",
    messages: [{ role: "user", content: userMessage }]
  });

  console.log('📤 Making request to OpenRouter...');

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "HTTP-Referer": "https://vercel-deployment-tau-six.vercel.app",
        "X-Title": "DeepSeek Vercel App"
      },
      body: postData
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500)
      });
      
      return res.status(response.status).json({ 
        error: `OpenRouter API error: ${response.status} ${response.statusText}`,
        details: errorText,
        debug: {
          hasApiKey: !!process.env.DEEPSEEK_API_KEY,
          apiKeyPrefix: process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.substring(0, 10) + '...' : 'MISSING'
        }
      });
    }

    const data = await response.json();
    console.log('📄 Response data keys:', Object.keys(data));
    console.log('📄 Has choices:', !!data.choices);
    console.log('📄 Choices length:', data.choices?.length);

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("⚠️ No reply in response:", JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: "No response content from DeepSeek",
        debug: data
      });
    }

    console.log("✅ Success! Reply length:", reply.length);
    return res.status(200).json({ reply });
    
  } catch (err) {
    console.error("❌ Network/Parse error:", err.message);
    console.error("❌ Full error:", err);
    return res.status(500).json({ 
      error: "Request to DeepSeek failed",
      details: err.message
    });
  }
}
