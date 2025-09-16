# Use Node 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --unsafe-perm

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start app directly via ts-node
CMD ["npx", "ts-node", "src/main.ts"]
