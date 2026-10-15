FROM node:20-slim

# Install Python, pip, ffmpeg, Deno (JS runtime for yt-dlp signature solving), and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Deno as an additional JS runtime for yt-dlp YouTube signature extraction
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

# Install latest NIGHTLY yt-dlp (includes newest YouTube anti-bot fixes)
RUN pip3 install --no-cache-dir --break-system-packages -U "yt-dlp[default]" && \
    yt-dlp --update-to nightly || true

# Install the PO Token (Proof-of-Origin) provider plugin for yt-dlp
# This is REQUIRED to bypass YouTube's BotGuard challenges from datacenter IPs
RUN pip3 install --no-cache-dir --break-system-packages -U bgutil-ytdlp-pot-provider || true

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
