# Node.js Image Scaler 🖼️

## Overview

This is a simple image scaling service built with Node.js. It uses [Express](https://expressjs.com/) for the web server, [Sharp](https://sharp.pixelplumbing.com/) for image processing, [Axios](https://axios-http.com/) for HTTP requests, and [NodeCache](https://www.npmjs.com/package/node-cache) for caching.

## Features

- Dynamic image resizing and cropping
- Image caching for optimized performance
- Supports various query parameters like `top`, `bottom`, `left`, `right`, `fit`, `width`, `height`, `background`, `dpr`, and `gravity`

## Prerequisites

- Node.js
- npm

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd your-repo
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Create a `.env` file and add your environment variables or set environment accordingly:**
    ```env
    PORT=3000
    IMAGE_SOURCE_URL=https://your-remote-host.com/
    ```

5. **Run the server:**
    ```bash
    npm start
    ```

## Usage

To scale an image, make a GET request to `/images/:imageId` with the desired query parameters.

**Example:**
```bash
curl http://localhost:3000/images/sample-image?width=300&height=300&fit=cover
