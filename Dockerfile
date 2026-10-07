FROM node:20-slim

# Install Python, pip, and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy all source code
COPY . .

# Build Next.js
RUN npm run build

# Create media storage directory
RUN mkdir -p /app/media_storage

# Expose port (7860 for Hugging Face Spaces)
EXPOSE 7860

ENV NODE_ENV=production
ENV PORT=7860
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start", "--", "-p", "7860"]
