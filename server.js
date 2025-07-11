const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    // You can add more logic here for custom replies
    res.json({ reply: `You said: ${userMessage}. Pikaichu is here for you! 💛` });
});

// Start server
const PORT = 5600;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
