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

// GAMIFICATION LOGIC
function getGamifyUserKey() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  return user ? 'gamify_' + user.email : 'gamify_guest';
}
function getGamifyData() {
  const key = getGamifyUserKey();
  let data = JSON.parse(localStorage.getItem(key) || '{}');
  if (!data.streak) data.streak = 0;
  if (!data.lastEntry) data.lastEntry = '';
  if (!data.badges) data.badges = [];
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}
function setGamifyData(data) {
  localStorage.setItem(getGamifyUserKey(), JSON.stringify(data));
}
function addJournalEntry() {
  const today = new Date().toISOString().slice(0,10);
  let data = getGamifyData();
  if (data.lastEntry === today) return false; // already journaled today
  if (data.lastEntry && (new Date(today) - new Date(data.lastEntry) > 86400000)) {
    data.streak = 1; // missed a day, reset streak
  } else {
    data.streak = (data.streak || 0) + 1;
  }
  data.lastEntry = today;
  // Award badges
  let badge = null;
  if (data.streak === 3 && !data.badges.includes('bronze')) badge = 'bronze';
  if (data.streak === 7 && !data.badges.includes('silver')) badge = 'silver';
  if (data.streak === 14 && !data.badges.includes('gold')) badge = 'gold';
  if (data.streak === 30 && !data.badges.includes('platinum')) badge = 'platinum';
  if (badge) {
    data.badges.push(badge);
    showGamifyConfetti();
    setTimeout(() => { alert(`Awesome! You’ve journaled ${data.streak} days in a row! Badge earned: ${badge}`); }, 500);
  }
  setGamifyData(data);
  renderGamifyDashboard();
  return true;
}
function renderGamifyDashboard() {
  const data = getGamifyData();
  const streakDiv = document.querySelector('.gamify-streak');
  const progressDiv = document.querySelector('.gamify-progress');
  const badgesDiv = document.querySelector('.gamify-badges');
  const challengesDiv = document.querySelector('.gamify-challenges');
  if (!streakDiv || !progressDiv || !badgesDiv || !challengesDiv) return;
  streakDiv.innerHTML = `Journaling Streak: <strong>${data.streak}</strong> day${data.streak === 1 ? '' : 's'}`;
  // Progress bar
  let nextMilestone = 3;
  if (data.streak >= 3 && data.streak < 7) nextMilestone = 7;
  else if (data.streak >= 7 && data.streak < 14) nextMilestone = 14;
  else if (data.streak >= 14 && data.streak < 30) nextMilestone = 30;
  else if (data.streak >= 30) nextMilestone = 30;
  let progress = Math.min(data.streak / nextMilestone, 1);
  progressDiv.innerHTML = `
    <div class="gamify-progress-bar">
      <div class="gamify-progress-fill" style="width:${progress*100}%"></div>
    </div>
    <div>Progress to next badge: <strong>${data.streak}/${nextMilestone}</strong></div>
  `;
  // Badges
  const badgeMap = {
    bronze: { emoji: '🥉', label: 'Bronze (3d)' },
    silver: { emoji: '🥈', label: 'Silver (7d)' },
    gold: { emoji: '🥇', label: 'Gold (14d)' },
    platinum: { emoji: '🏆', label: 'Platinum (30d)' }
  };
  badgesDiv.innerHTML = '';
  data.badges.forEach(b => {
    badgesDiv.innerHTML += `<div class="gamify-badge ${b}">${badgeMap[b].emoji}<span class="badge-label">${badgeMap[b].label}</span></div>`;
  });
  // Challenges
  let challengeMsg = '';
  if (data.streak < 7) challengeMsg = 'Challenge: Journal every day for 7 days to unlock a secret badge!';
  else if (data.streak < 14) challengeMsg = 'Challenge: Keep going for 14 days for Gold!';
  else if (data.streak < 30) challengeMsg = 'Challenge: 30 days for Platinum!';
  else challengeMsg = 'You’ve completed all streak challenges!';
  challengesDiv.innerHTML = challengeMsg;
}
function showGamifyConfetti() {
  const modal = document.getElementById('gamify-modal');
  if (!modal) return;
  let confetti = document.createElement('div');
  confetti.className = 'gamify-confetti';
  confetti.innerHTML = '🎉🎊✨';
  modal.appendChild(confetti);
  setTimeout(() => confetti.remove(), 1800);
}
function openGamifyModal() {
  document.getElementById('gamify-modal').style.display = 'flex';
  renderGamifyDashboard();
}
function closeGamifyModal() {
  document.getElementById('gamify-modal').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => {
  const gamifyBtn = document.getElementById('gamify-btn');
  if (gamifyBtn) {
    gamifyBtn.onclick = openGameModal;
  }
  // Add journal entry button to dashboard
  const modal = document.getElementById('gamify-modal');
  if (modal) {
    // Remove any existing journal button to prevent duplicates
    const existingBtn = modal.querySelector('.gamify-modal-content .pastel-btn.journal-btn');
    if (!existingBtn) {
      let journalBtn = document.createElement('button');
      journalBtn.className = 'pastel-btn journal-btn';
      journalBtn.style.marginTop = '1rem';
      journalBtn.textContent = 'Add Journal Entry';
      journalBtn.onclick = function() {
        if (addJournalEntry()) {
          showGamifyConfetti();
        } else {
          alert('You already journaled today!');
        }
      };
      modal.querySelector('.gamify-modal-content').appendChild(journalBtn);
    }
  }
});

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameOver = false;
let lastMoveIdx = null;
function openGameModal() {
  document.getElementById('gameModal').style.display = 'flex';
  resetTicTacToe();
}
function closeGameModal() {
  document.getElementById('gameModal').style.display = 'none';
}
document.getElementById('gameModal').addEventListener('click', function(e) {
  if (e.target === this) closeGameModal();
});
function resetTicTacToe() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameOver = false;
  lastMoveIdx = null;
  createTicTacToeBoard();
  document.getElementById('postGameMsg').style.display = 'none';
  document.getElementById('playAgainBtn').style.display = 'none';
  document.getElementById('game-status').innerText = `Your turn: X`;
}
function createTicTacToeBoard() {
  const boardEl = document.getElementById('game-board');
  boardEl.innerHTML = '';
  board.forEach((cell, i) => {
    const cellEl = document.createElement('div');
    cellEl.className = 'ttt-cell';
    cellEl.dataset.index = i;
    cellEl.innerText = cell;
    if (lastMoveIdx === i) cellEl.classList.add('last-move');
    if (!cell && !gameOver) {
      cellEl.onclick = () => handleCellClick(i);
    }
    boardEl.appendChild(cellEl);
  });
}
function handleCellClick(index) {
  if (board[index] !== '' || gameOver) return;
  board[index] = currentPlayer;
  lastMoveIdx = index;
  createTicTacToeBoard();
  if (checkWinner()) {
    document.getElementById('game-status').innerText = `You won!`;
    document.getElementById('postGameMsg').innerText = `Nice try 🌟 Wanna play again?`;
    document.getElementById('postGameMsg').style.display = 'block';
    document.getElementById('playAgainBtn').style.display = 'inline-block';
    gameOver = true;
    return;
  }
  if (board.every(cell => cell)) {
    document.getElementById('game-status').innerText = `It's a draw!`;
    document.getElementById('postGameMsg').innerText = `Great effort! 🌟 Play again?`;
    document.getElementById('postGameMsg').style.display = 'block';
    document.getElementById('playAgainBtn').style.display = 'inline-block';
    gameOver = true;
    return;
  }
  currentPlayer = 'O';
  document.getElementById('game-status').innerText = `Waiting for bot...`;
  setTimeout(() => {
    botMove();
  }, 700);
}
function botMove() {
  if (gameOver) return;
  let emptyIndices = board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
  if (emptyIndices.length === 0) return;
  let idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  board[idx] = 'O';
  lastMoveIdx = idx;
  createTicTacToeBoard();
  if (checkWinner()) {
    document.getElementById('game-status').innerText = `You lost!`;
    document.getElementById('postGameMsg').innerText = `Kind bot: "You did great! Try again?" 😊`;
    document.getElementById('postGameMsg').style.display = 'block';
    document.getElementById('playAgainBtn').style.display = 'inline-block';
    gameOver = true;
    return;
  }
  if (board.every(cell => cell)) {
    document.getElementById('game-status').innerText = `It's a draw!`;
    document.getElementById('postGameMsg').innerText = `Great effort! 🌟 Play again?`;
    document.getElementById('postGameMsg').style.display = 'block';
    document.getElementById('playAgainBtn').style.display = 'inline-block';
    gameOver = true;
    return;
  }
  currentPlayer = 'X';
  document.getElementById('game-status').innerText = `Your turn!`;
}
function checkWinner() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) => board[a] && board[a] === board[b] && board[b] === board[c]);
}
// Journal button logic
function addJournalEntry() {
  const today = new Date().toISOString().slice(0,10);
  let data = getGamifyData();
  if (data.lastEntry === today) {
    alert('You already journaled today!');
    return false;
  }
  if (data.lastEntry && (new Date(today) - new Date(data.lastEntry) > 86400000)) {
    data.streak = 1;
  } else {
    data.streak = (data.streak || 0) + 1;
  }
  data.lastEntry = today;
  let badge = null;
  if (data.streak === 3 && !data.badges.includes('bronze')) badge = 'bronze';
  if (data.streak === 7 && !data.badges.includes('silver')) badge = 'silver';
  if (data.streak === 14 && !data.badges.includes('gold')) badge = 'gold';
  if (data.streak === 30 && !data.badges.includes('platinum')) badge = 'platinum';
  if (badge) {
    data.badges.push(badge);
    showGamifyConfetti();
    setTimeout(() => { alert(`Awesome! You’ve journaled ${data.streak} days in a row! Badge earned: ${badge}`); }, 500);
  }
  setGamifyData(data);
  renderGamifyDashboard();
  return true;
}
document.addEventListener('DOMContentLoaded', () => {
  // Journal button
  const journalBtn = document.getElementById('addJournalBtn');
  if (journalBtn) {
    journalBtn.onclick = addJournalEntry;
  }
  // Play Again button
  const playAgainBtn = document.getElementById('playAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.onclick = resetTicTacToe;
  }
  // View Wellness Dashboard button in game modal
  const viewDashboardBtn = document.querySelector('#gameModal .pastel-btn[onclick="openGamifyModal()"]');
  if (viewDashboardBtn) {
    viewDashboardBtn.onclick = openGamifyModal;
  }
  // Modal close buttons
  const closeGameBtn = document.querySelector('#gameModal .gamify-close');
  if (closeGameBtn) {
    closeGameBtn.onclick = closeGameModal;
  }
  const closeGamifyBtn = document.querySelector('#gamify-modal .gamify-close');
  if (closeGamifyBtn) {
    closeGamifyBtn.onclick = closeGamifyModal;
  }
  // Floating button
  const gamifyBtn = document.getElementById('gamify-btn');
  if (gamifyBtn) {
    gamifyBtn.onclick = openGameModal;
  }
  // Chat send button
  const tttSendBtn = document.querySelector('#gameModal .pastel-btn[onclick="sendTicTacMessage()"]');
  if (tttSendBtn) {
    tttSendBtn.onclick = sendTicTacMessage;
  }
  // Emoji buttons
  const emojiBtns = document.querySelectorAll('#gameModal .pastel-btn[data-mood]');
  emojiBtns.forEach(btn => {
    btn.onclick = function() {
      setMood(this.getAttribute('data-mood'));
      sendSupportEmoji(this.textContent);
    }
  });

// Audio test button logic
const startMusicBtn = document.getElementById('start-music-btn');
if (startMusicBtn) {
  startMusicBtn.addEventListener('click', () => {
    const audio = document.getElementById('background-music');
    audio.src = 'https://cdn.pixabay.com/download/audio/2022/03/26/audio_3ae0075d88.mp3?filename=ukulele-sunshine-5932.mp3'; // example audio
    audio.volume = 0.3;
    audio.muted = false;
    audio.play()
      .then(() => console.log('Audio is playing!'))
      .catch(e => console.error('Play failed:', e));
  });
}

// YouTube Iframe API integration for mood-based music
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: '', // start empty
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: '', // loop requires playlist param with videoId
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      mute: 1 // mute initially to avoid autoplay block
    },
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

// Map moods to YouTube video IDs of copyright-free instrumental music
const moodVideos = {
  happy: 's9MszVE7aR4',    // example happy instrumental
  neutral: 'hHW1oY26kxQ',  // chill instrumental
  sad: 'F58p8csoO6E',      // soft piano
  angry: 'JGwWNGJdvx8',    // energetic
  anxious: 'B-RMc9i5AQY'   // relaxing ambient
};

function setMood(mood) {
  // Change background filter, message, etc. (your existing code)
  
  // YouTube music logic
  if (typeof player !== 'undefined' && player && moodVideos[mood]) {
    player.loadVideoById(moodVideos[mood]);
    player.unMute(); // Unmute to allow sound
    player.playVideo();
  }
}

});

// Track games played
let gamesPlayed = parseInt(localStorage.getItem('pikaichuGames') || '0');
gamesPlayed++;
localStorage.setItem('pikaichuGames', gamesPlayed);

document.getElementById('gameCount').innerText = localStorage.getItem('pikaichuGames') || 0;


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

function sendTicTacMessage() {
  const msg = document.getElementById('tttMessage').value.trim();
  if (msg) {
    const chatbox = document.getElementById('ttt-chatbox');
    const para = document.createElement('p');
    para.innerText = `You: ${msg}`;
    chatbox.appendChild(para);
    document.getElementById('tttMessage').value = '';
    chatbox.scrollTop = chatbox.scrollHeight;
    // Bot reply
    setTimeout(() => {
      const botReplies = [
        "hi let's play!",
        "let's relax!",
        "play with me!"
      ];
      const botMsg = document.createElement('p');
      botMsg.innerText = `Bot: ${botReplies[Math.floor(Math.random() * botReplies.length)]}`;
      chatbox.appendChild(botMsg);
      chatbox.scrollTop = chatbox.scrollHeight;
    }, 700);
  }
}
function sendSupportEmoji(emoji) {
  const chatbox = document.getElementById('ttt-chatbox');
  const para = document.createElement('p');
  para.innerText = `You: ${emoji}`;
  chatbox.appendChild(para);
  chatbox.scrollTop = chatbox.scrollHeight;
  // Bot reply
  setTimeout(() => {
    const botReplies = [
      "hi let's play!",
      "let's relax!",
      "play with me!"
    ];
    const botMsg = document.createElement('p');
    botMsg.innerText = `Bot: ${botReplies[Math.floor(Math.random() * botReplies.length)]}`;
    chatbox.appendChild(botMsg);
    chatbox.scrollTop = chatbox.scrollHeight;
  }, 700);
}
