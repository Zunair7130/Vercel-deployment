export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  const postData = JSON.stringify({
    model: "deepseek/deepseek-chat",
    messages: [{ role: "user", content: userMessage }]
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL || "https://localhost:3000",
        "X-Title": "DeepSeek Vercel App"
      },
      body: postData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("⚠️ Reply not found in response!");
      return res.status(500).json({ reply: "No response from DeepSeek" });
    }

    console.log("✅ Final reply:", reply);
    res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ reply: "Request to DeepSeek failed" });
  }
}
