#!/usr/bin/env bash

TARGET_DIR="$1"
OUTPUT_FILE="${2:-code-dump.txt}"

if [ -z "$TARGET_DIR" ]; then
  echo "Usage: ./dump-code.sh <directory> [output-file]"
  exit 1
fi

BASE_DIR="$(pwd)"

> "$OUTPUT_FILE"

find "$TARGET_DIR" -type f | sort | while read -r file; do
  ABS_PATH="$(cd "$(dirname "$file")" && pwd)/$(basename "$file")"

  # файл вне директории запуска — пропускаем
  if [[ "$ABS_PATH" != "$BASE_DIR"* ]]; then
    continue
  fi

  REL_PATH="${ABS_PATH#$BASE_DIR/}"

  {
    echo "============================================================"
    echo "FILE: $REL_PATH"
    echo "============================================================"
    echo
    cat "$file"
    echo
    echo
  } >> "$OUTPUT_FILE"
done

echo "✅ Code dump written to: $OUTPUT_FILE"
