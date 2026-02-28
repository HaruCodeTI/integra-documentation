#!/bin/bash
WEBP_FILE="$1"
MP4_FILE="$2"

if [ ! -f "$WEBP_FILE" ]; then
    echo "Webp file not found: $WEBP_FILE"
    exit 1
fi

echo "Waiting for $WEBP_FILE to stabilize..."
PRV_SIZE=0
STABLE_COUNT=0
for i in {1..60}; do
    CUR_SIZE=$(stat -f%z "$WEBP_FILE")
    if [ "$CUR_SIZE" -gt 100000 ] && [ "$CUR_SIZE" -eq "$PRV_SIZE" ]; then
        STABLE_COUNT=$((STABLE_COUNT+1))
        if [ "$STABLE_COUNT" -ge 2 ]; then
            echo "File stabilized at $CUR_SIZE bytes."
            break
        fi
    else
        STABLE_COUNT=0
    fi
    PRV_SIZE=$CUR_SIZE
    sleep 10
done

TMP_DIR=$(mktemp -d)
echo "Extracting frames to $TMP_DIR..."

echo "Using python: $(which python3)"
python3 /Users/arthurbueno/HaruCode/Integra/integra-docs/extract_webp.py "$WEBP_FILE" "$TMP_DIR"
echo "Encoding to MP4..."
ffmpeg -nostdin -y -f concat -safe 0 -i "$TMP_DIR/input.txt" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p "$MP4_FILE"

rm -rf "$TMP_DIR"
echo "Done converting $WEBP_FILE to $MP4_FILE!"
