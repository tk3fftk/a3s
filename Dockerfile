# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-alpine AS runtime

# Install AWS CLI for CLI provider support
RUN apk add --no-cache aws-cli

WORKDIR /app

# Copy package files for production install
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S a3s -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R a3s:nodejs /app

# Switch to non-root user
USER a3s

# Expose port (not strictly necessary for CLI app, but good practice)
EXPOSE 3000

# Run the application
CMD ["node", "dist/cli.js"]
