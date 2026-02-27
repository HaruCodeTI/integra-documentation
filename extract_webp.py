import sys
import os
from PIL import Image, ImageSequence

def extract_frames(webp_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    img = Image.open(webp_path)
    count = 0
    base = Image.new('RGBA', img.size, (0,0,0,0))
    
    with open(os.path.join(output_dir, 'input.txt'), 'w') as f:
        try:
            for frame in ImageSequence.Iterator(img):
                dur_ms = frame.info.get('duration', 100)
                dur_sec = dur_ms / 1000.0
                if dur_sec <= 0:
                    dur_sec = 0.1
                    
                fname = f"frame_{count:04d}.png"
                abs_fname = os.path.join(output_dir, fname)
                
                base.paste(frame, (0, 0), frame.convert('RGBA'))
                out_frame = base.convert('RGB')
                out_frame.save(abs_fname)
                
                f.write(f"file '{abs_fname}'\n")
                f.write(f"duration {dur_sec}\n")
                count += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            
        if count > 0:
            last_abs_fname = os.path.join(output_dir, f"frame_{count-1:04d}.png")
            f.write(f"file '{last_abs_fname}'\n")

    print(f"Extracted {count} frames.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_webp.py input.webp output_dir")
        sys.exit(1)
    extract_frames(sys.argv[1], sys.argv[2])
