# Stage 1: Build the application
FROM node:23-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Declare build arguments for all environment variables
ARG DB_URI
ARG DB_USER
ARG NEO4J_PASSWORD
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG OPENAI_API_KEY
ARG NEXT_PUBLIC_LANGFUSE_SECRET_KEY
ARG NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY
ARG NEXT_PUBLIC_LANGFUSE_HOST

# Set environment variables for the build process
ENV DB_URI=${DB_URI} \
    DB_USER=${DB_USER} \
    NEO4J_PASSWORD=${NEO4J_PASSWORD} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    OPENAI_API_KEY=${OPENAI_API_KEY} \
    NEXT_PUBLIC_LANGFUSE_SECRET_KEY=${NEXT_PUBLIC_LANGFUSE_SECRET_KEY} \
    NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY=${NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY} \
    NEXT_PUBLIC_LANGFUSE_HOST=${NEXT_PUBLIC_LANGFUSE_HOST}

# Copy dependency files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the Next.js application in standalone mode
RUN pnpm build

# Stage 2: Run the standalone production application
FROM node:23-alpine AS runner

# Set the working directory
WORKDIR /app

# Declare build arguments again to set runtime environment variables
ARG DB_URI
ARG DB_USER
ARG NEO4J_PASSWORD
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG OPENAI_API_KEY
ARG NEXT_PUBLIC_LANGFUSE_SECRET_KEY
ARG NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY
ARG NEXT_PUBLIC_LANGFUSE_HOST

# Set environment variables for runtime
ENV NODE_ENV=production \
    DB_URI=${DB_URI} \
    DB_USER=${DB_USER} \
    NEO4J_PASSWORD=${NEO4J_PASSWORD} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    OPENAI_API_KEY=${OPENAI_API_KEY} \
    NEXT_PUBLIC_LANGFUSE_SECRET_KEY=${NEXT_PUBLIC_LANGFUSE_SECRET_KEY} \
    NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY=${NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY} \
    NEXT_PUBLIC_LANGFUSE_HOST=${NEXT_PUBLIC_LANGFUSE_HOST}

# Copy only the standalone build from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port that the app will run on
EXPOSE 3000

# Command to run the standalone app
CMD ["node", "server.js"]