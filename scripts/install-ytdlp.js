const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.platform === 'linux') {
  const target = path.join(process.cwd(), 'yt-dlp');
  if (!fs.existsSync(target)) {
    console.log('Downloading standalone yt-dlp binary for Linux on Render...');
    try {
      execSync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod a+rx yt-dlp', {
        stdio: 'inherit'
      });
      console.log('Standalone yt-dlp installed successfully.');
    } catch (e) {
      console.warn('Could not download standalone yt-dlp binary. Will fallback to system python.', e.message);
    }
  }
}
