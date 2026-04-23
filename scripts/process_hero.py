#!/usr/bin/env python3

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def scrub_image(image: Image.Image) -> Image.Image:
    cleaned = Image.new("RGB", image.size, (1, 10, 31))
    cleaned.paste(image.convert("RGB"))
    return cleaned


def process_hero(input_path: Path, output_path: Path, max_width: int) -> Path:
    if not input_path.exists():
        raise FileNotFoundError(f"{input_path} not found.")

    image = ImageOps.exif_transpose(Image.open(input_path))
    image = scrub_image(image)

    if image.width > max_width:
        target_height = round(image.height * (max_width / image.width))
        image = image.resize((max_width, target_height), Image.Resampling.LANCZOS)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(
        output_path,
        format="WEBP",
        quality=72,
        method=6,
    )
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Process BR9ja hero image.")
    parser.add_argument("input_path", help="Path to the source hero image.")
    parser.add_argument(
        "--output",
        default="processed_br9ja_hero_desktop.webp",
        help="Output webp filename.",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=1920,
        help="Maximum output width. Source images are never upscaled.",
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    saved_path = process_hero(Path(args.input_path), output_path, args.max_width)
    print(saved_path)


if __name__ == "__main__":
    main()
