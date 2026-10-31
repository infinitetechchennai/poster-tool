#!/usr/bin/env python3
"""Test script to generate marketing assets using Pollinations AI.

Usage:
    python3 scripts/test_pollinations.py
    python3 scripts/test_pollinations.py --prompt "Enterprise AI Agents" --template corporate_services
    python3 scripts/test_pollinations.py --model "black-forest-labs/flux.1-schnell" --width 1080 --height 1350
"""

import sys
import os
import argparse

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.services.pollinations.pollinations_service import pollinations_service


def main():
    parser = argparse.ArgumentParser(description="Generate an image with Pollinations AI for testing.")
    parser.add_argument("--prompt", type=str, default="Enterprise Cloud Automation and AI Agents", help="Topic or prompt")
    parser.add_argument("--template", type=str, default="corporate_services", choices=[
        "corporate_services", "educational_informational", "product_promotion", "problem_solution", "announcements_campaigns"
    ], help="Template to optimize prompt composition for")
    parser.add_argument("--model", type=str, default="black-forest-labs/flux.1-schnell", help="Pollinations model name")
    parser.add_argument("--width", type=int, default=1080, help="Image width in pixels")
    parser.add_argument("--height", type=int, default=1350, help="Image height in pixels")
    parser.add_argument("--raw-prompt", action="store_true", help="Use exact prompt without auto-composition")

    args = parser.parse_args()

    print("=" * 60)
    print("Pollinations AI Image Generation Tester")
    print("=" * 60)

    # 1. Build prompt
    if args.raw_prompt:
        final_prompt = args.prompt
    else:
        final_prompt = pollinations_service.build_composition_prompt(
            topic=args.prompt,
            template_id=args.template,
            aspect_ratio=f"{args.width}:{args.height}"
        )

    print(f"Template Target : {args.template}")
    print(f"Model           : {args.model}")
    print(f"Dimensions      : {args.width}x{args.height}")
    print(f"Generated Prompt:\n  \"{final_prompt}\"\n")
    print("Requesting generation from Pollinations AI...")

    # 2. Call generation
    res = pollinations_service.generate_image(
        prompt=final_prompt,
        model=args.model,
        width=args.width,
        height=args.height,
        timeout=30
    )

    print("-" * 60)
    print(f"Status        : {res.status}")
    print(f"Model Used    : {res.model}")
    print(f"Cost Estimate : {res.cost_estimate}")
    print(f"Local File    : {res.local_image_path}")
    print(f"Web URL Path  : {res.image_url}")
    print("-" * 60)

    if os.path.exists(res.local_image_path):
        size_kb = os.path.getsize(res.local_image_path) / 1024
        print(f"Image successfully saved ({size_kb:.1f} KB).")
        print(f"To view the image, you can run:\n  open \"{res.local_image_path}\"")
    else:
        print("Image file was not saved.")

if __name__ == "__main__":
    main()
