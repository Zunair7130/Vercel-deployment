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

  // Send to backend
  try {
    const res = await fetch("/api/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message })
});


    const data = await res.json();
    botMsg.textContent = data.reply?.trim() || "✅ Got response but it's empty.";
  } catch (err) {
    botMsg.textContent = "❌ Failed to get response.";
    console.error(err);
  }

  input.value = "";
});
