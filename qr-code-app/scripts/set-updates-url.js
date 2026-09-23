// Called by CI after `eas init`: points expo-updates at this project's EAS Update URL.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const projectId = config.expo.extra?.eas?.projectId;
if (!projectId) {
  console.error('Missing expo.extra.eas.projectId; run `eas init` first.');
  process.exit(1);
}
config.expo.updates = { ...config.expo.updates, url: `https://u.expo.dev/${projectId}` };
fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
console.log(projectId);
