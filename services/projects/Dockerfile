FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 3002

# Start the app
CMD ["node", "src/index.js"]
