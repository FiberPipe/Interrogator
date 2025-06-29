#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import sys
import json

def print_progress(current, total, message=""):
    """Выводит прогресс в формате JSON для легкого парсинга"""
    progress_data = {
        "type": "progress",
        "current": current,
        "total": total,
        "percentage": round((current / total) * 100, 2),
        "message": message
    }
    print(json.dumps(progress_data))
    sys.stdout.flush()  # Немедленный вывод

print("Initializing data processing script...")
time.sleep(1)

# Симуляция обработки данных
total_items = 20

for i in range(total_items):
    # Выводим прогресс
    print_progress(i + 1, total_items, f"Processing batch {i + 1}")
    
    # Симуляция работы
    time.sleep(0.3)
    
    # Иногда выводим дополнительную информацию
    if i % 5 == 0:
        print(f"Checkpoint reached at item {i + 1}")

print("\n" + "="*50)
print("Processing complete!")
print(f"Total time: ~{total_items * 0.3} seconds")
