#!/bin/bash
WEBP_FILE="$1"
MP4_FILE="$2"

if [ ! -f "$WEBP_FILE" ]; then
    echo "Webp file not found: $WEBP_FILE"
    exit 1
fi

TMP_DIR=$(mktemp -d)
echo "Extracting frames to $TMP_DIR..."

echo "Using python: $(which python3)"
python3 /Users/arthurbueno/HaruCode/Integra/integra-docs/extract_webp.py "$WEBP_FILE" "$TMP_DIR"
echo "Encoding to MP4..."
ffmpeg -nostdin -y -f concat -safe 0 -i "$TMP_DIR/input.txt" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p "$MP4_FILE"

rm -rf "$TMP_DIR"
echo "Done converting $WEBP_FILE to $MP4_FILE!"
