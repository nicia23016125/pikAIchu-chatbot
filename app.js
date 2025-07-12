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

// SIGNUP LOGIC

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector('.auth-form');
  if (signupForm && document.getElementById('signup-email')) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value.trim();
      if (!name || !email || !password) {
        alert('Please fill in all fields.');
        return;
      }
      // Save user data to localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email === email)) {
        alert('Email already registered.');
        return;
      }
      users.push({ name, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      alert('🎉 Signup successful! You can now log in.');
      window.location.href = 'login.html';
    });
  }
});

// LOGIN LOGIC

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.auth-form');
  if (loginForm && document.getElementById('login-email')) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert('🎉 Login successful!');
        window.location.href = 'index.html';
      } else {
        alert('Invalid email or password.');
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('risk-map');
  if (!mapContainer) return;

const map = L.map('risk-map').setView([27, 130], 4.5); // lat, lng, zoom
map.setView([30, 132], 5); // more zoomed into those 3 countries
map.setMaxBounds([
  [0, 90],    // Southwest corner
  [50, 150]   // Northeast corner
]);

  // Clean, English-labeled tile (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(map);

  // Heatmap data: [lat, lng, intensity]
  const heatData = [
    [37.5665, 126.9780, 0.95], // Seoul
    [35.6895, 139.6917, 0.85], // Tokyo
    [1.3521, 103.8198, 0.7],   // Singapore
    [35.1796, 129.0756, 0.75], // Busan
    [34.6937, 135.5023, 0.6],  // Osaka
    [35.0116, 135.7681, 0.5],  // Kyoto
    [36.2048, 138.2529, 0.4],  // Central Japan
    [36.5, 127.8, 0.6]         // Central South Korea
  ];
const bounds = L.latLngBounds([
  [1.35, 103.82],   // Singapore
  [37.56, 126.98],  // Seoul
  [35.68, 139.69]   // Tokyo
]);
map.fitBounds(bounds, { padding: [30, 30] });

  L.heatLayer(heatData, {
    radius: 30,
    blur: 25,
    maxZoom: 10,
    gradient: {
      0.2: '#ffcccc',
      0.4: '#ff6666',
      0.7: '#cc0000',
      0.95: '#990000'
    }
  }).addTo(map);
});

// DISCUSSION LOGIC

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const discussionInput = document.querySelector('.modal-input');
  const sendBtn = modal ? modal.querySelector('button.pastel-btn') : null;
  const discussionsList = document.querySelector('.discussions-list');

  // Load discussions from localStorage
  function loadDiscussions() {
    let discussions = JSON.parse(localStorage.getItem('discussions') || '[]');
    // Remove old dynamic discussions
    document.querySelectorAll('.discussion-dynamic').forEach(el => el.remove());
    discussions.forEach(disc => {
      const article = document.createElement('article');
      article.className = 'discussion-topic discussion-dynamic';
      article.innerHTML = `
        <div class="topic-icon" style="background: #ffe066;"><span>💬</span></div>
        <div class="topic-content">
          <h2>${disc.title}</h2>
          <p>${disc.text.replace(/\n/g, '<br>')}</p>
          <div class="discussion-meta">${disc.author ? 'By ' + disc.author : 'By Guest'}</div>
        </div>
      `;
      discussionsList.appendChild(article);
    });
  }
  if (discussionsList) loadDiscussions();

  // Prevent Enter from submitting, allow new lines
  if (discussionInput) {
    discussionInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Insert newline
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
        e.preventDefault();
      }
    });
  }

  // Handle discussion submit
  if (sendBtn && discussionInput) {
    sendBtn.onclick = function() {
      const text = discussionInput.value.trim();
      if (!text) return;
      const topic = document.getElementById('modal-title').textContent || 'General';
      let user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
      let discussions = JSON.parse(localStorage.getItem('discussions') || '[]');
      discussions.push({
        title: topic,
        text,
        author: user ? user.name : ''
      });
      localStorage.setItem('discussions', JSON.stringify(discussions));
      loadDiscussions();
      discussionInput.value = '';
      document.getElementById('modal').style.display = 'none';
    };
  }
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
