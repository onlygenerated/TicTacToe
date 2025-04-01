const express = require('express');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

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
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "vivid"  // Changed from "natural" to "vivid" for more iconic results
        });

        res.json({ url: response.data[0].url });
    } catch (error) {
        console.error('Error:', error);
        
        // Handle OpenAI API errors
        if (error.error) {
            return res.status(400).json({
                error: error.error.message || 'Content policy violation. Please try a different prompt.',
                code: error.error.code
            });
        }
        
        // Handle other errors
        res.status(500).json({ 
            error: 'Failed to generate image. Please try again.',
            code: 'server_error'
        });
    }
});

// Use environment port or default to 8000, with fallback to 3000
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port 3000...`);
        app.listen(3000, () => {
            console.log('Server running at http://localhost:3000');
        });
    } else {
        console.error('Server error:', e);
    }
});
