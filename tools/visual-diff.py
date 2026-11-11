"""Pixel diff for tools/visual-check.mjs.

Usage: python visual-diff.py <baseline.png> <current.png> [threshold]
Exit 0 when the differing-pixel ratio is within threshold, 1 otherwise.
The threshold is a ratio (0.005 = 0.5% of pixels) and ignores tiny
anti-aliasing deltas by only counting channel differences above 12.
"""
import sys

from PIL import Image, ImageChops


def main():
    if len(sys.argv) < 3:
        print('usage: visual-diff.py <baseline.png> <current.png> [threshold]')
        return 2
    threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.005
    a = Image.open(sys.argv[1]).convert('RGB')
    b = Image.open(sys.argv[2]).convert('RGB')
    if a.size != b.size:
        print('size mismatch: %s vs %s' % (a.size, b.size))
        return 1
    diff = ImageChops.difference(a, b).convert('L')
    histogram = diff.histogram()
    total = a.size[0] * a.size[1]
    changed = sum(histogram[13:])
    ratio = changed / total if total else 0
    print('changed %d/%d (%.4f%%)' % (changed, total, ratio * 100))
    return 1 if ratio > threshold else 0


if __name__ == '__main__':
    sys.exit(main())
