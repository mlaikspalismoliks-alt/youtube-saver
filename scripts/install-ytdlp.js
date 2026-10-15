const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.platform === 'linux') {
  const target = path.join(process.cwd(), 'yt-dlp');
  if (!fs.existsSync(target)) {
    console.log('Downloading latest nightly yt-dlp binary for Linux...');
    try {
      // Download the nightly build which contains the latest YouTube anti-bot fixes
      execSync(
        'curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -o yt-dlp && chmod a+rx yt-dlp',
        { stdio: 'inherit' }
      );
      console.log('Nightly yt-dlp binary installed successfully.');
    } catch (e) {
      // Fallback to stable release
      console.warn('Nightly download failed, trying stable release...', e.message);
      try {
        execSync(
          'curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod a+rx yt-dlp',
          { stdio: 'inherit' }
        );
        console.log('Stable yt-dlp binary installed successfully.');
      } catch (e2) {
        console.warn('Could not download yt-dlp binary. Will fallback to system python.', e2.message);
      }
    }
  } else {
    // Update existing binary to nightly
    console.log('Updating existing yt-dlp to nightly...');
    try {
      execSync(`${target} --update-to nightly`, { stdio: 'inherit' });
    } catch {
      console.warn('Could not update yt-dlp to nightly channel.');
    }
  }
}
