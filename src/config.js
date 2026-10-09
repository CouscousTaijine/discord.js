const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(process.cwd(), 'config.json');
if (fs.existsSync(configPath)) {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Invalid config.json: ' + error.message);
    process.exit(1);
  }
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.trim() && !process.env[key]) {
      process.env[key] = value.trim();
    } else if (typeof value === 'number' && process.env[key] === undefined) {
      process.env[key] = String(value);
    }
  }
}
module.exports = {};
