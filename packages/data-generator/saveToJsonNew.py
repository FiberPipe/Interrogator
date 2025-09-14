#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import serial, json, time, sys, argparse
from datetime import datetime
from collections import defaultdict

import numpy as np
import matplotlib                 ; matplotlib.use('TkAgg')
import matplotlib.pyplot as plt

SERIAL_PORT = 'COM8'
BAUD_RATE   = 9600
SAVE_FILE   = r'C:/Users/Egor.Kovalev/Desktop/ghj/alg_new/alg_v9_A2_IKEKIK2025-05-02-v01/data.json'
WINDOW_SEC  = 60# «скользящее» окно по времени (с)

parser = argparse.ArgumentParser(description="Live-графики 16 каналов: P ± σ")
parser.add_argument('--plot', action='store_true',help='Запустить окно визуализации.')
parser.add_argument('--plotsensor', action='store_true', help='Отобразить P1, P2, P4, P12.')
parser.add_argument('--plotlambda', action='store_true', help='Отобразить вычисленную длину волны.')

args = parser.parse_args()


try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)
except Exception as e:
    sys.exit(f'Не удалось открыть {SERIAL_PORT}: {e}')

with open(SAVE_FILE, 'w', encoding='utf-8') as f:
    f.write('[')
first_entry = True


def save_to_file(pkt: dict):
    global first_entry
    with open(SAVE_FILE, 'a', encoding='utf-8') as f:
        if not first_entry:
            f.write(',\n')
        json.dump(pkt, f, ensure_ascii=False)
    first_entry = False

def unix_time(hms: str) -> float:
    """'HH:MM:SS(.mmm)' → seconds from midnight."""
    for fmt in ('%H:%M:%S.%f', '%H:%M:%S'):
        try:
            dt = datetime.strptime(hms, fmt)
            return (dt.hour*3600 + dt.minute*60 + dt.second +
                    dt.microsecond/1e6)
        except ValueError:
            pass
    return 0.

def trim_window(t: list, series: list[list], now: float):
    """Remove points older than now-WINDOW_SEC from all lists."""
    while t and t[0] < now - WINDOW_SEC:
        t.pop(0)
        for s in series:
            s.pop(0)


if args.plot:
    plt.ion()
    fig, axs = plt.subplots(2, 2, figsize=(12, 7), sharex=True)
    fig.canvas.manager.set_window_title('Каналы P0–P15  (P ± σ)')
    groups  = [(0,1,2,3), (4,5,6,7), (8,9,10,11), (12,13,14,15)]
    colors4 = plt.cm.tab10(np.linspace(0, 1, 4))  # 4 цвета в каждом subplot

    for ax in axs.flat:
        ax.grid(True, linestyle=':')
        ax.set_xlabel('Время, c')
        ax.set_ylabel('P')

    plt.tight_layout()

# ДОБАВЛЕНО: условие для инициализации окна plotsensor
if args.plotsensor:
    plt.ion()
    fig_sensor, ax_sensor = plt.subplots(figsize=(10, 5))
    fig_sensor.canvas.manager.set_window_title('P1 и P4 без stdDev')
    ax_sensor.grid(True, linestyle=':')
    ax_sensor.set_xlabel('Время, с')
    ax_sensor.set_ylabel('P')
    plt.tight_layout()

if args.plotlambda:
    plt.ion()
    fig_lambda, ax_lambda = plt.subplots(figsize=(10, 5))
    fig_lambda.canvas.manager.set_window_title('Вычисленная длина волны (λ) по времени')
    ax_lambda.grid(True, linestyle=':')
    ax_lambda.set_xlabel('Время, с')
    ax_lambda.set_ylabel('Длина волны, нм')
    

t_series   = []                        
P_series   = defaultdict(list)          
STD_series = defaultdict(list)          
t0 = None                              
lambda_series = []

try:
    while True:
        raw = ser.readline().decode('utf-8', 'replace').strip()
        if raw:
            try:
                pkt = json.loads(raw)
            except json.JSONDecodeError:
                print('Ошибка JSON:', raw)
                continue
            
            save_to_file(pkt)
            t_pkt = unix_time(pkt.get('time', '00:00:00'))
            if t0 is None:
                t0 = t_pkt
            t_now = t_pkt - t0
            t_series.append(t_now)
            #Вычисление длины волны
            P1 = pkt.get('P1', np.nan)
            P2 = pkt.get('P2', np.nan)
            P4 = pkt.get('P4', np.nan)
            P12 = pkt.get('P12', np.nan)

            # Нормализация
            P1_norm = 
            P2_norm =  - 2.820
            P3_norm =  - 2.600
            P4_norm = P - 2.560
            P5_norm = P - 2.515
            P6_norm = P - 2.820
            P7_norm = P - 2.600
            P8_norm = P - 2.560
            P9_norm = P - 2.515
            P10_norm = P - 2.820
            P11_norm = P - 2.600
            P12_norm = P - 2.560
            P13_norm = P - 2.515
            P14_norm = P - 2.820
            P15_norm = P - 2.600
            P16_norm = P - 2.560

            weights = np.array([P1_norm, _norm, P4_norm, P12_norm])
            lambdas = np.array([1547.1, 1547.9, 1548.7, 1546.25])

            if np.all(np.isfinite(weights)) and np.sum(weights) > 0:
                lam = np.dot(weights, lambdas) / np.sum(weights)
            else:
                lam = np.nan

            lambda_series.append(lam)
            trim_window(t_series, [lambda_series], t_now)



            for ch in range(16):
                P_series[ch].append(pkt.get(f'P{ch}', np.nan))
                STD_series[ch].append(pkt.get(f'stdDev{ch}', np.nan))

            trim_window(t_series,
                        list(P_series.values())+list(STD_series.values()),
                        t_now)

        xs = np.asarray(t_series)

        if args.plot and t_series:
            for ax, grp in zip(axs.flat, groups):
                ax.cla()
                ax.grid(True, linestyle=':')
                ax.set_xlabel('Время, c')
                ax.set_ylabel('P')
                for col, ch in zip(colors4, grp):
                    ys = np.asarray(P_series[ch])
                    yerr = np.asarray(STD_series[ch])

                    ax.errorbar(xs, ys, yerr=yerr,
                                fmt='-', ecolor=col, elinewidth=1,
                                capsize=0.3, alpha=0.9)
                    ax.scatter(xs, ys, c=[col], s=10,
                               marker='o', label=f'P{ch}',
                               edgecolors='none', zorder=3)
                ax.relim(); ax.autoscale_view()
                ax.legend(fontsize=8, loc='upper left')

            fig.canvas.draw_idle()
            plt.pause(0.02)

        elif args.plotsensor and t_series:
            ax_sensor.cla()
            ax_sensor.grid(True, linestyle=':')
            ax_sensor.set_xlabel('Время, с')
            ax_sensor.set_ylabel('P')

            # Подготовка данных
            xs = np.asarray(t_series)
            ys1 = np.asarray(P_series[1])
            ys2 = np.asarray(P_series[2])
            ys4 = np.asarray(P_series[4])
            ys12 = np.asarray(P_series[12])

            # Отрисовка всех 4 каналов
            ax_sensor.plot(xs, ys1, 'b-', label='P1')
            ax_sensor.plot(xs, ys2, 'r-', label='P2')
            ax_sensor.plot(xs, ys4, 'g-', label='P4')
            ax_sensor.plot(xs, ys12, 'm-', label='P12')

            ax_sensor.scatter(xs, ys1, c='b', s=10)
            ax_sensor.scatter(xs, ys2, c='r', s=10)
            ax_sensor.scatter(xs, ys4, c='g', s=10)
            ax_sensor.scatter(xs, ys12, c='m', s=10)

            # Автоматическое масштабирование
            ax_sensor.relim()
            ax_sensor.autoscale_view()

            # Легенда
            ax_sensor.legend(loc='upper left')

            fig_sensor.canvas.draw_idle()
            plt.pause(0.02)
        elif args.plotlambda and t_series:
            ax_lambda.cla()
            ax_lambda.grid(True, linestyle=':')
            ax_lambda.set_xlabel('Время, с')
            ax_lambda.set_ylabel('Длина волны, нм')

            xs = np.asarray(t_series)
            ys = np.asarray(lambda_series)
            ax_lambda.plot(xs, ys, 'm-', label='λ вычисленная')
            ax_lambda.scatter(xs, ys, c='m', s=10)

            ax_lambda.relim()
            ax_lambda.autoscale_view()
            ax_lambda.legend(loc='upper left')

            fig_lambda.canvas.draw_idle()
            plt.pause(0.02)

        else:
            time.sleep(0.02)



except KeyboardInterrupt:
    print('Завершено пользователем.')

finally:
    with open(SAVE_FILE, 'a', encoding='utf-8') as f:
        f.write('\n]')
    ser.close()
    if args.plot:
        plt.ioff()
        plt.show()
