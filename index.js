const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const NodeCache = require('node-cache');
const app = express();
const port = 3000;
const remoteHost = 'https://amoiproductionstorage.blob.core.windows.net/assets/images/';
const myCache = new NodeCache(); // Create a cache instance

app.get('/images/:imageId', async (req, res) => {
  const { top, bottom, left, right, fit, width, height, background, dpr } = req.query;
  const imageId = req.params.imageId;
  
  // Create a cache key based on query parameters and image ID
  const cacheKey = `${imageId}-${top}-${bottom}-${left}-${right}-${fit}-${width}-${height}-${background}-${dpr}`;

  // Check if image exists in cache
  const cachedImage = myCache.get(cacheKey);

  if (cachedImage) {
    res.type('image/png');
    return res.send(cachedImage);
  }

  try {
    const { data } = await axios({
      method: 'get',
      url: `${remoteHost}${imageId}`,
      responseType: 'arraybuffer',
    });

    let image = sharp(data);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    const newTop = +top || 0;
    const newLeft = +left || 0;
    const newWidth = originalWidth - (newLeft + (+right || 0));
    const newHeight = originalHeight - (newTop + (+bottom || 0));

    image = image.extract({ top: newTop, left: newLeft, width: newWidth, height: newHeight });

    if (background) {
      image = image.flatten({ background });
    }

    if (fit && width && height) {
      image = image.resize({ width: Math.round(+width * (dpr || 1)), height: Math.round(+height * (dpr || 1)), fit: fit });
    }

    if (dpr) {
      image = image.withMetadata({ density: Math.round(72 * dpr) });
    }

    // Convert to buffer for caching
    const imageBuffer = await image.toBuffer();
    
    // Store image in cache
    myCache.set(cacheKey, imageBuffer);

    res.type('image/png');
    res.send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(400).send('Could not process image.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});