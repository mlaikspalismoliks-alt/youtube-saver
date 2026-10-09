FROM node:20-slim

# Install Python, pip, and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Copy package files and install dependencies (including devDependencies needed for next build)
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# Copy all source code
COPY . .

# Build Next.js
RUN npm run build

# Create media storage directory
RUN mkdir -p /app/media_storage

# Expose default port (Render sets $PORT=10000 by default, Hugging Face sets $PORT=7860)
EXPOSE 10000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "npm start -- -p ${PORT:-10000}"]
