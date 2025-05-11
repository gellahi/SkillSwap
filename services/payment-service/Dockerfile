FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm ci

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3007

# Start the app
CMD ["node", "dist/main"]
