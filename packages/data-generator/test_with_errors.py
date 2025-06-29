#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import sys

print("Python script started successfully!")
print(f"Python version: {sys.version}")
print("-" * 50)

# Простой вывод
for i in range(5):
    print(f"Progress: {i + 1}/5")
    time.sleep(1)  # Задержка в 1 секунду

print("-" * 50)
print("Script completed successfully!")
