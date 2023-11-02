// Import required modules
const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const NodeCache = require('node-cache');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app and port
const app = express();
const port = process.env.PORT || 3000;

// Define remote host for images
const remoteHost = process.env.IMAGE_SOURCE_URL;

// Initialize cache
const myCache = new NodeCache();

// Define image scaling route
app.get('/images/:imageId', async (req, res) => {
    // Extract query parameters and image ID from request
    const { top, bottom, left, right, fit, width, height, background, dpr, gravity } = req.query;
    const imageId = req.params.imageId;

    // Generate a unique cache key
    const cacheKey = `${imageId}-${top}-${bottom}-${left}-${right}-${fit}-${width}-${height}-${background}-${dpr}-${gravity}`;

    // Check cache for existing image
    const cachedImage = myCache.get(cacheKey);

    // If image is cached, return it
    if (cachedImage) {
        res.type('image/png');
        return res.send(cachedImage);
    }

    try {
        // Fetch image from remote host
        const { data } = await axios({
            method: 'get',
            url: `${remoteHost}${imageId}`,
            responseType: 'arraybuffer',
        });

        // Initialize Sharp and get image metadata
        let image = sharp(data);
        const metadata = await image.metadata();

        // Calculate new dimensions based on query params
        const newTop = +top || 0;
        const newLeft = +left || 0;
        const newWidth = metadata.width - (newLeft + (+right || 0));
        const newHeight = metadata.height - (newTop + (+bottom || 0));

        // Crop image
        image = image.extract({ top: newTop, left: newLeft, width: newWidth, height: newHeight });

        // Apply background if specified
        if (background) {
            image = image.flatten({ background });
        }

        // Resize and apply gravity if needed
        if (fit && width && height) {
            image = image.resize({ width: Math.round(+width * (dpr || 1)), height: Math.round(+height * (dpr || 1)), fit: fit, position: gravity || 'center' });
        }

        // Apply density if specified
        if (dpr) {
            image = image.withMetadata({ density: Math.round(72 * dpr) });
        }

        // Convert image to buffer for caching
        const imageBuffer = await image.toBuffer();

        // Get image format from metadata
        const format = metadata.format;

        // Cache the processed image
        myCache.set(cacheKey, { buffer: imageBuffer, format });

        // Send the processed image
        res.type(format);
        res.send(imageBuffer);
    } catch (err) {
        // Log error and send a 400 response
        console.error(err);
        res.status(400).send('Could not process image.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
