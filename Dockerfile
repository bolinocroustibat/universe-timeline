# --- Build stage ---
FROM oven/bun:slim AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install ALL dependencies (including dev dependencies) needed for building the app
RUN bun install --frozen-lockfile

# Copy the remaining source code (respecting .dockerignore)
COPY . .

# Build the application
RUN bun run build

# --- Production stage ---
FROM oven/bun:slim
WORKDIR /app

# Copy the compiled build output from the builder stage
COPY --from=builder /app/build ./
COPY --from=builder /app/node_modules ./node_modules

# Create volume mount point for static files
VOLUME /app/static

# Expose the application port
EXPOSE 3000

# --- Environment Variables ---
# OPTIONAL: Tells the app to listen on all network interfaces. Bun does it by default.
ENV HOST=0.0.0.0
# OPTIONAL: Defaults to 3000 anyway, but recommended for clarity to match the EXPOSE instruction
ENV PORT=3000
# OPTIONAL: Required ONLY if using SvelteKit behind a reverse proxy AND using Form Actions (POST requests), to prevent CSRF security blocks
ENV HOST_HEADER=host
ENV PROTOCOL_HEADER=x-forwarded-proto

# Start the application
CMD ["bun", "index.js"]
