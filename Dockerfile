# Use the official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=10000

# Start the application
CMD ["pnpm", "start"]
