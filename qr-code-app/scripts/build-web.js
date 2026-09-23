// Builds the static web version into web-dist/ and zips it for upload.
// Paths are rewritten to be relative so the site works from any folder on
// any ordinary host (domain root or a sub-folder), not only from "/".
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'web-dist');
const zip = path.join(root, 'qr-code-app-web.zip');

fs.rmSync(out, { recursive: true, force: true });
fs.rmSync(zip, { force: true });
execSync(`npx expo export --platform web --output-dir "${out}"`, { cwd: root, stdio: 'inherit' });
fs.rmSync(path.join(out, 'metadata.json'), { force: true });

const html = path.join(out, 'index.html');
fs.writeFileSync(
  html,
  fs.readFileSync(html, 'utf8').replace(/(src|href)="\/(?!\/)/g, '$1="./'),
);

const jsDir = path.join(out, '_expo', 'static', 'js', 'web');
for (const name of fs.readdirSync(jsDir)) {
  const file = path.join(jsDir, name);
  // Asset URLs (icon fonts) are resolved against the page, so "./assets" works anywhere
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('"/assets/', '"./assets/'));
}

execSync(`cd "${out}" && zip -qr "${zip}" .`);
console.log(`\nWeb build ready: ${path.relative(root, out)}/ and ${path.relative(root, zip)}`);
