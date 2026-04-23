#!/usr/bin/env python3

from pathlib import Path

from PIL import Image


ASSETS = [
    ("logo_web_header.webp", (250, 150), "WEBP", {"quality": 82, "method": 6}),
    ("app_icon_android_ios.png", (1024, 1024), "PNG", {"optimize": True}),
    ("favicon.png", (48, 48), "PNG", {"optimize": True}),
    ("apple_touch_icon.png", (180, 180), "PNG", {"optimize": True}),
]


def process_logo(input_path: Path, output_dir: Path) -> None:
    if not input_path.exists():
        raise FileNotFoundError(f"{input_path} not found.")

    output_dir.mkdir(parents=True, exist_ok=True)
    image = Image.open(input_path).convert("RGBA")

    for name, (width, height), fmt, save_options in ASSETS:
        frame = image.copy()
        frame.thumbnail((width, height), Image.Resampling.LANCZOS)
        background = Image.new("RGBA", (width, height), (255, 255, 255, 0))
        offset = ((width - frame.width) // 2, (height - frame.height) // 2)
        background.paste(frame, offset, frame)
        export_image = background
        if fmt == "PNG":
            export_image = background.quantize(
                colors=256,
                method=Image.Quantize.FASTOCTREE,
            )
        export_image.save(output_dir / name, format=fmt, **save_options)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source_logo = root / "assets" / "brand" / "logo_master.png"
    process_logo(source_logo, root / "web" / "assets")
    process_logo(source_logo, root / "bayright9ja_web" / "public" / "assets")
    print("Generated logo assets for static web and Next web.")


if __name__ == "__main__":
    main()
