document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.querySelector("input");
  const chatBox = document.querySelector("#chat-history");
  const message = input.value.trim();
  if (!message) return;
  input.value = ""; 

  // Append user message
  const userWrapper = document.createElement("div");
  userWrapper.className = "message-wrapper";
  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.textContent = message;
  userWrapper.appendChild(userMsg);
  chatBox.appendChild(userWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Append placeholder bot message
  const botWrapper = document.createElement("div");
  botWrapper.className = "message-wrapper";
  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.textContent = "⏳ Thinking...";
  botWrapper.appendChild(botMsg);
  chatBox.appendChild(botWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Send to backend with better error handling
  try {
    console.log('🚀 Sending request to /api/ask...');
    
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ message })
    });

    console.log('📥 Response status:', res.status);
    console.log('📥 Response ok:', res.ok);

    const data = await res.json();
    console.log('📄 Response data:', data);

    if (!res.ok) {
      // Display detailed error info
      console.error('❌ API Error:', data);
      botMsg.textContent = `❌ Error ${res.status}: ${data.error || 'Unknown error'}`;
      
      // Log additional debug info if available
      if (data.debug) {
        console.error('Debug info:', data.debug);
      }
      if (data.details) {
        console.error('Error details:', data.details);
      }
      return;
    }

    // Success case
    if (data.reply) {
      botMsg.textContent = data.reply.trim();
    } else {
      botMsg.textContent = "✅ Got response but it's empty.";
      console.warn('Empty reply in response:', data);
    }
    
  } catch (err) {
    console.error('❌ Network/Parse error:', err);
    botMsg.textContent = `❌ Network error: ${err.message}`;
  }
});

// Add test function for debugging
window.testAPI = async function() {
  console.log('🧪 Testing /api/ask endpoint...');
  
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ message: "Hello test" })
    });
    
    console.log('Test response status:', res.status);
    console.log('Test response ok:', res.ok);
    
    const data = await res.json();
    console.log('Test response data:', data);
    
    return data;
    
  } catch (err) {
    console.error('Test failed:', err);
    return { error: err.message };
  }
};

console.log('💡 Use testAPI() in console to debug the API endpoint');
