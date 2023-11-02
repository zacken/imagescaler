# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 3000

# Define environment variable for Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV PORT="3000"

# Run app.js when the container launches
CMD ["npm", "start"]
