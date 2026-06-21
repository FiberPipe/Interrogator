#!/usr/bin/env bash

TARGET_DIR="$1"

if [ -z "$TARGET_DIR" ]; then
  echo "Usage: ./prepend-path.sh <directory>"
  exit 1
fi

BASE_DIR="$(pwd)"

find "$TARGET_DIR" -type f | while read -r file; do
  ABS_PATH="$(cd "$(dirname "$file")" && pwd)/$(basename "$file")"
  REL_PATH="${ABS_PATH#$BASE_DIR/}"

  # Если файл не внутри pwd (на всякий)
  if [[ "$ABS_PATH" != "$BASE_DIR"* ]]; then
    echo "Skip (outside base dir): $file"
    continue
  fi

  # Не добавлять повторно
  if head -n 1 "$file" | grep -q "$REL_PATH"; then
    echo "Skip (already added): $REL_PATH"
    continue
  fi

  TMP_FILE="$(mktemp)"

  {
    echo "// $REL_PATH"
    echo
    cat "$file"
  } > "$TMP_FILE"

  mv "$TMP_FILE" "$file"

  echo "Updated: $REL_PATH"
done
