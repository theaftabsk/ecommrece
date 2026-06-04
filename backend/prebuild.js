const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const oldDistPath = path.join(__dirname, 'dist-old');

// 1. Try to clean up any previous dist-old folder
if (fs.existsSync(oldDistPath)) {
  try {
    fs.rmSync(oldDistPath, { recursive: true, force: true });
    console.log('Cleaned previous dist-old folder');
  } catch (err) {
    console.warn('Warning: Could not delete old dist-old (files may be locked by running server):', err.message);
  }
}

// 2. Rename the current dist to dist-old (safely bypasses active file locks on Linux)
if (fs.existsSync(distPath)) {
  try {
    fs.renameSync(distPath, oldDistPath);
    console.log('Successfully renamed dist to dist-old');
  } catch (err) {
    console.warn('Could not rename dist to dist-old. Attempting direct delete...');
    try {
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log('Successfully deleted dist folder');
    } catch (deleteErr) {
      console.warn('Warning: Failed to clear dist. Nest build will attempt to overwrite:', deleteErr.message);
      // We do not crash the process (exit 0) so the build can still run
    }
  }
}
