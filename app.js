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

//login

// login form logic
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.auth-form');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault(); // prevent page reload

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (email === '' || password === '') {
        alert('Please fill in both email and password.');
      } else {
        // simulate login success — replace with real login logic later
        alert('🎉 Login successful!');
        window.location.href = 'index.html'; // redirect to homepage or dashboard
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
