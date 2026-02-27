#!/bin/bash

for webp in /Users/arthurbueno/.gemini/antigravity/brain/50580821-268f-4eb9-b8cf-ce6e97320548/*.webp; do
  base=$(basename "$webp" | sed 's/_[0-9]*\.webp//')
  name=""
  case "$base" in
    acesso_sistema_v2) name="acesso-e-navegacao-acessando-o-sistema" ;;
    recuperacao_senha_v2) name="acesso-e-navegacao-recuperacao-de-senha" ;;
    dashboard_visao_geral_v2) name="acesso-e-navegacao-dashboard-visao-geral" ;;
    menu_lateral_v2) name="acesso-e-navegacao-menu-lateral" ;;
  esac
  
  if [ -n "$name" ]; then
    echo "Processing $name from $webp..."
    out_dir="/tmp/${name}_frames"
    
    # Extract frames
    rm -rf "$out_dir"
    mkdir -p "$out_dir"
    echo "Extracting frames..."
    python3 /Users/arthurbueno/HaruCode/Integra/integra-docs/extract_webp.py "$webp" "$out_dir"
    
    # Convert frames to video
    echo "Encoding video..."
    ffmpeg -nostdin -y -f concat -safe 0 -i "$out_dir/input.txt" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p "/Users/arthurbueno/HaruCode/Integra/integra-docs/public/videos/${name}-v2.mp4"
    
    echo "Done $name."
  fi
done
