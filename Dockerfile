FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Create logs directory (will be overridden by volume in production)
RUN mkdir -p logs

EXPOSE 3000

CMD ["node", "server.js"]
