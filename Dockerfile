# --- Build stage ---
FROM oven/bun:slim AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install ALL dependencies (including dev dependencies) needed for building the app
RUN bun install --frozen-lockfile

# Copy the remaining source code (respecting .dockerignore)
COPY . .

# Official adapter-bun needs the Bun runtime, not Vite's Node shebang
RUN bun run build

# --- Production stage ---
FROM oven/bun:slim
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

RUN bun install --production --frozen-lockfile

# Timeline JSONC files can be mounted over build/client at runtime

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
CMD ["bun", "./build"]
