const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const docsDir = '/Users/arthurbueno/HaruCode/Integra/integra-docs';
const manifestPath = path.join(docsDir, 'data', 'videos-manifest.json');

function getVideoDuration(videoPath) {
    try {
        const fullPath = path.join(docsDir, 'public', videoPath);
        if (!fs.existsSync(fullPath)) return null;

        // Get duration using ffprobe
        const result = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullPath}"`, { encoding: 'utf-8' });
        const durationObj = parseFloat(result.trim());
        return Math.round(durationObj);
    } catch (error) {
        console.error(`Error getting duration for ${videoPath}:`, error.message);
        return null;
    }
}

async function updateManifest() {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    let updatedCount = 0;

    for (const entry of manifest) {
        const duration = getVideoDuration(entry.videoPath);
        if (duration !== null) {
            entry.durationSec = duration;

            const fullPath = path.join(docsDir, 'public', entry.videoPath);
            const stats = fs.statSync(fullPath);
            entry.capturedAt = stats.mtime.toISOString();
            updatedCount++;
        }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`Updated ${updatedCount} videos in the manifest.`);
}

updateManifest();
