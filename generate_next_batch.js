const fs = require('fs');

const mapping = JSON.parse(fs.readFileSync('data/docs-mapping.json', 'utf8'));
const manifestFile = 'data/videos-manifest.json';
let manifest = [];
if (fs.existsSync(manifestFile)) {
    manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
}

const videosDir = 'public/videos';
let currentFiles = [];
if (fs.existsSync(videosDir)) {
    currentFiles = fs.readdirSync(videosDir);
}

const validVideos = currentFiles.filter(f => {
    const stat = fs.statSync(`${videosDir}/${f}`);
    return f.endsWith('.mp4') && stat.size > 20000; // valid ones > 20KB
});

const remaining = mapping.filter(m => {
    const expectedFile = m.doc_slug.replace(/\//g, '-') + '-v2.mp4';
    return !validVideos.includes(expectedFile);
});

console.log("Remaining tasks:");
for (let i = 0; i < Math.min(5, remaining.length); i++) {
    console.log(`${remaining[i].doc_slug} | ${remaining[i].route}`);
}
