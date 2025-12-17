# Use lightweight Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies required for Prism (OpenSSL)
RUN apk add --no-cache openssl

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the application port
EXPOSE 4000

# Start command (using start script from package.json)
CMD ["npm", "run", "start"]
