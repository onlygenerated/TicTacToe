require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const path = require('path');

const app = express();

// Create OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Serve static files
app.use(express.static(path.join(__dirname, '/')));
app.use(express.json());

// Generate image endpoint
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const response = await openai.images.generate({
            model: "dall-e-2",
            prompt: `A luscious, simplified, easy to read icon version of ${prompt} in the style of Peter Max centered, on a transparent background, suitable for a game piece`,
            n: 1,
            size: "256x256"
        });

        res.json({ url: response.data[0].url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// Use environment port or default to 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
