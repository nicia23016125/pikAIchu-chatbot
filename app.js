// app.js

function toggleChat() {
  const chatbox = document.getElementById('chatbox');
  if (chatbox.style.display === 'flex') {
    chatbox.style.display = 'none';
  } else {
    chatbox.style.display = 'flex';
  }
}

function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  const chatBody = document.querySelector('.chat-body');

  // Display user message
  const userMsg = document.createElement('p');
  userMsg.innerHTML = `<strong>You:</strong> ${message}`;
  chatBody.appendChild(userMsg);

  // Send message to backend
  fetch('http://localhost:5600/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  })
  .then(res => res.json())
  .then(data => {
    const botMsg = document.createElement('p');
    botMsg.innerHTML = `<strong>Pikaichu:</strong> ${data.reply || '💛 I’m here for you.'}`;
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  })
  .catch(err => {
    const errorMsg = document.createElement('p');
    errorMsg.innerHTML = `<strong>Pikaichu:</strong> Sorry, I’m having trouble connecting 😢`;
    chatBody.appendChild(errorMsg);
  });

  input.value = '';
}

// Fade transition on load
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(() => {
      console.log('Service Worker registered');
    }).catch(err => {
      console.error('SW registration failed:', err);
    });
  });
}
