# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js application in standalone mode
RUN npm run build

# Stage 2: Run the standalone production application
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only the standalone build from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port that the app will run on
EXPOSE 3000

# Command to run the standalone app
CMD ["node", "server.js"]
