# Build stage
FROM oven/bun:latest as builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:latest
WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/build ./
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules

# Create volume mount point for SQLite database
VOLUME /app/static

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "index.js", "--port", "3000"]
