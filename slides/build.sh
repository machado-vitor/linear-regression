#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

npx -y @marp-team/marp-cli@latest slides.md --pdf --allow-local-files -o slides.pdf
