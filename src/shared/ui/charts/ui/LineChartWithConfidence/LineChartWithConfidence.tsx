import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { Slider, Input, Button, ButtonGroup, Switch, Tooltip } from '@heroui/react';
import { Maximize2, Radio, Pause } from 'lucide-react';

export interface ChartDataPoint {
  x: number | string;
  y: number;
  yMin?: number;
  yMax?: number;
  timestamp?: string | number;
  [key: string]: any;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  data: ChartDataPoint[];
  showConfidence?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface ReferenceLine {
  y: number;
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  opacity?: number;
}

interface LineChartWithConfidenceProps {
  series: ChartSeries[];
  referenceLines?: ReferenceLine[];
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  /** Сохранено для совместимости API; uPlot использует индекс точки как ось X. */
  xAxisDataKey?: string;
  enableZoom?: boolean;
  defaultVisiblePoints?: number;
  showLegend?: boolean;
  /** Сохранено для совместимости API (кастомный тултип recharts больше не используется). */
  customTooltip?: unknown;
}

interface AlarmZone {
  min: number;
  max: number;
  color: string;
}

const toNum = (v: unknown): number | null =>
  typeof v === 'number' && isFinite(v) ? v : null;

const parseDash = (dash?: string): number[] | undefined => {
  if (!dash) return undefined;
  const parts = dash
    .split(/[\s,]+/)
    .map((p) => parseFloat(p))
    .filter((n) => isFinite(n));
  return parts.length ? parts : undefined;
};

/** Сигнатура структуры графика: при её изменении uPlot пересоздаётся, иначе — только setData. */
const structureSignature = (
  series: ChartSeries[],
  yAxisLabel?: string,
  showLegend?: boolean,
): string =>
  JSON.stringify({
    yAxisLabel,
    showLegend,
    s: series.map((s) => [s.key, s.color, !!s.showConfidence, s.strokeWidth, s.strokeDasharray]),
  });

/** Выравнивает серии по индексу точки в формат данных uPlot: [xs, y1, (y1max, y1min), y2, ...]. */
const buildPlotData = (series: ChartSeries[]): uPlot.AlignedData => {
  const maxLen = series.reduce((m, s) => Math.max(m, s.data.length), 0);
  const xs = new Array<number>(maxLen);
  for (let i = 0; i < maxLen; i++) xs[i] = i;

  const cols: (number | null)[][] = [xs];

  series.forEach((s) => {
    const ys = new Array<number | null>(maxLen);
    for (let i = 0; i < maxLen; i++) ys[i] = toNum(s.data[i]?.y);
    cols.push(ys);

    if (s.showConfidence) {
      const ymax = new Array<number | null>(maxLen);
      const ymin = new Array<number | null>(maxLen);
      for (let i = 0; i < maxLen; i++) {
        ymax[i] = toNum(s.data[i]?.yMax);
        ymin[i] = toNum(s.data[i]?.yMin);
      }
      cols.push(ymax, ymin);
    }
  });

  return cols as unknown as uPlot.AlignedData;
};

/** Подписи точек (timestamp / x) для оси X и тултипа. */
const buildLabels = (series: ChartSeries[]): (string | number)[] => {
  const ref = series.find((s) => s.data.length > 0);
  if (!ref) return [];
  return ref.data.map((p, i) => p.timestamp ?? p.x ?? i);
};

/** Группирует референсные линии вида "Канал Min/Max" в закрашенные зоны. */
const computeAlarmZones = (referenceLines: ReferenceLine[]): AlarmZone[] => {
  const byChannel: Record<string, { min?: number; max?: number; color?: string }> = {};

  referenceLines.forEach((line) => {
    const match = line.label?.match(/^(.+?)\s+(Min|Max)$/);
    if (!match) return;
    const [, channel, type] = match;
    byChannel[channel] = byChannel[channel] || {};
    if (type === 'Min') byChannel[channel].min = line.y;
    else byChannel[channel].max = line.y;
    byChannel[channel].color = line.stroke;
  });

  const zones: AlarmZone[] = [];
  Object.values(byChannel).forEach((z) => {
    if (z.min !== undefined && z.max !== undefined && z.color) {
      zones.push({ min: z.min, max: z.max, color: z.color });
    }
  });
  return zones;
};

export const LineChartWithConfidence = ({
  series,
  referenceLines = [],
  height = 400,
  xAxisLabel,
  yAxisLabel,
  enableZoom = true,
  defaultVisiblePoints = 50,
  showLegend = true,
}: LineChartWithConfidenceProps) => {
  const maxDataLength = series.reduce((m, s) => Math.max(m, s.data.length), 0);

  // X-диапазон (окно отображения по индексу точки)
  const [xRange, setXRange] = useState<[number, number]>([
    Math.max(0, maxDataLength - defaultVisiblePoints),
    Math.max(0, maxDataLength - 1),
  ]);

  // Кастомный Y-диапазон
  const [customYMin, setCustomYMin] = useState('');
  const [customYMax, setCustomYMax] = useState('');
  const [useCustomYDomain, setUseCustomYDomain] = useState(false);
  const [showAlarmZones, setShowAlarmZones] = useState(true);
  // Авто-прокрутка к свежим данным. Отключается при ручном зуме/перемотке.
  const [isFollowing, setIsFollowing] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  // Колбэки взаимодействия для uPlot-хуков (создаются один раз, читают актуальные обработчики).
  const interactionsRef = useRef<{
    onSelect: (x0: number, x1: number, y0: number, y1: number) => void;
    onReset: () => void;
  }>({ onSelect: () => {}, onReset: () => {} });

  // Рефы, которые читают uPlot-колбэки (чтобы не пересоздавать инстанс).
  const xRangeRef = useRef(xRange);
  const yDomainRef = useRef<[number, number] | null>(null);
  const labelsRef = useRef<(string | number)[]>([]);
  const seriesMetaRef = useRef(series);
  const referenceLinesRef = useRef(referenceLines);
  const showAlarmZonesRef = useRef(showAlarmZones);

  const alarmZones = useMemo(() => computeAlarmZones(referenceLines), [referenceLines]);
  const alarmZonesRef = useRef(alarmZones);

  seriesMetaRef.current = series;
  referenceLinesRef.current = referenceLines;
  alarmZonesRef.current = alarmZones;

  // Подготовка данных и подписей
  const plotData = useMemo(() => buildPlotData(series), [series]);
  const labels = useMemo(() => buildLabels(series), [series]);
  labelsRef.current = labels;

  const signature = useMemo(
    () => structureSignature(series, yAxisLabel, showLegend),
    [series, yAxisLabel, showLegend],
  );

  // Автообновление X-окна при поступлении новых данных (только в режиме авто-прокрутки)
  useEffect(() => {
    if (!isFollowing || maxDataLength <= 0) return;
    const start = Math.max(0, maxDataLength - defaultVisiblePoints);
    const end = maxDataLength - 1;
    setXRange([start, end]);
  }, [maxDataLength, defaultVisiblePoints, isFollowing]);

  // Применение Y-диапазона
  useEffect(() => {
    if (!useCustomYDomain) {
      yDomainRef.current = null;
    } else {
      const min = parseFloat(customYMin);
      const max = parseFloat(customYMax);
      // Пока введён некорректный диапазон — остаёмся на авто, чтобы не схлопывать график.
      yDomainRef.current = isFinite(min) && isFinite(max) && max > min ? [min, max] : null;
    }
    plotRef.current?.redraw();
  }, [useCustomYDomain, customYMin, customYMax]);

  useEffect(() => {
    xRangeRef.current = xRange;
    plotRef.current?.redraw();
  }, [xRange]);

  useEffect(() => {
    showAlarmZonesRef.current = showAlarmZones;
    plotRef.current?.redraw();
  }, [showAlarmZones]);

  // Создание / пересоздание uPlot при изменении структуры
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const meta = seriesMetaRef.current;

    const uSeries: uPlot.Series[] = [
      {
        label: 'x',
        value: (_u, _v, _si, di) => {
          if (di == null) return '';
          const lbl = labelsRef.current[di];
          return lbl != null ? String(lbl) : '';
        },
      },
    ];
    const bands: uPlot.Band[] = [];

    meta.forEach((s) => {
      const mainIdx = uSeries.length;
      uSeries.push({
        label: s.label,
        stroke: s.color,
        width: s.strokeWidth ?? 2,
        dash: parseDash(s.strokeDasharray),
        spanGaps: true,
        points: { show: false },
        value: (_u, v) => (v == null ? '—' : v.toFixed(6)),
      });

      if (s.showConfidence) {
        const maxIdx = uSeries.length;
        uSeries.push({ stroke: 'transparent', points: { show: false }, spanGaps: true });
        const minIdx = uSeries.length;
        uSeries.push({ stroke: 'transparent', points: { show: false }, spanGaps: true });
        bands.push({ series: [maxIdx, minIdx], fill: hexToRgba(s.color, 0.12) });
      }
    });

    // Плагин: референсные линии и зоны алармов
    const overlayPlugin: uPlot.Plugin = {
      hooks: {
        draw: (u) => {
          const ctx = u.ctx;
          const { left, top, width, height: h } = u.bbox;
          ctx.save();
          ctx.beginPath();
          ctx.rect(left, top, width, h);
          ctx.clip();

          if (showAlarmZonesRef.current) {
            alarmZonesRef.current.forEach((zone) => {
              const yA = u.valToPos(zone.max, 'y', true);
              const yB = u.valToPos(zone.min, 'y', true);
              ctx.fillStyle = hexToRgba(zone.color, 0.08);
              ctx.fillRect(left, Math.min(yA, yB), width, Math.abs(yB - yA));
            });
          }

          referenceLinesRef.current.forEach((line) => {
            const y = u.valToPos(line.y, 'y', true);
            ctx.save();
            ctx.strokeStyle = line.stroke || '#888';
            ctx.globalAlpha = line.opacity ?? 0.6;
            ctx.lineWidth = line.strokeWidth ?? 1;
            ctx.setLineDash(parseDash(line.strokeDasharray) || [5, 5]);
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(left + width, y);
            ctx.stroke();
            ctx.restore();
          });

          ctx.restore();
        },
      },
    };

    // Плагин взаимодействия: выделение области -> ручной зум, двойной клик -> сброс.
    const interactionPlugin: uPlot.Plugin = {
      hooks: {
        setSelect: (u) => {
          const { left, top, width: w, height: hgt } = u.select;
          if (w < 6 || hgt < 6) return; // игнорируем клики и микровыделения
          const x0 = u.posToVal(left, 'x');
          const x1 = u.posToVal(left + w, 'x');
          const yTop = u.posToVal(top, 'y');
          const yBottom = u.posToVal(top + hgt, 'y');
          interactionsRef.current.onSelect(x0, x1, yBottom, yTop);
          u.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
        },
        ready: (u) => {
          u.over.addEventListener('dblclick', () => interactionsRef.current.onReset());
        },
      },
    };

    const opts: uPlot.Options = {
      width: el.clientWidth || 600,
      height,
      legend: { show: showLegend },
      cursor: {
        points: { size: 6 },
        focus: { prox: 30 },
        // Выделение прямоугольника по обеим осям; зум применяем сами в setSelect.
        drag: { x: true, y: true, setScale: false },
      },
      scales: {
        x: {
          time: false,
          range: (_u, dataMin, dataMax) => {
            const r = xRangeRef.current;
            return r ? [r[0], r[1]] : [dataMin, dataMax];
          },
        },
        y: {
          range: (_u, dataMin, dataMax) => {
            const yd = yDomainRef.current;
            if (yd) return yd;
            const [min, max] = uPlot.rangeNum(dataMin, dataMax, 0.1 as any, true as any) as [
              number,
              number,
            ];
            return [min, max];
          },
        },
      },
      axes: [
        {
          stroke: '#9ca3af',
          grid: { stroke: '#e5e7eb', width: 1 },
          ticks: { stroke: '#e5e7eb' },
          values: (_u, splits) =>
            splits.map((idx) => {
              const lbl = labelsRef.current[Math.round(idx)];
              return lbl != null ? String(lbl) : String(idx);
            }),
          label: xAxisLabel,
        },
        {
          stroke: '#9ca3af',
          grid: { stroke: '#e5e7eb', width: 1 },
          ticks: { stroke: '#e5e7eb' },
          values: (_u, splits) => splits.map((v) => v.toFixed(3)),
          label: yAxisLabel,
          size: 70,
        },
      ],
      series: uSeries,
      bands,
      plugins: [overlayPlugin, interactionPlugin],
    };

    const u = new uPlot(opts, plotData as uPlot.AlignedData, el);
    plotRef.current = u;

    return () => {
      u.destroy();
      plotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, height, xAxisLabel]);

  // Быстрый путь обновления данных без пересоздания инстанса
  useEffect(() => {
    plotRef.current?.setData(plotData as uPlot.AlignedData);
  }, [plotData]);

  // Адаптация размера под контейнер
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const u = plotRef.current;
      if (u) u.setSize({ width: el.clientWidth || 600, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  // Ручной зум по выделенной области: фиксируем X-окно и Y-диапазон.
  const handleSelectZoom = useCallback(
    (x0: number, x1: number, yLow: number, yHigh: number) => {
      setIsFollowing(false);
      const start = Math.max(0, Math.round(Math.min(x0, x1)));
      const end = Math.min(maxDataLength - 1, Math.round(Math.max(x0, x1)));
      if (end > start) setXRange([start, end]);
      setCustomYMin(yLow.toFixed(6));
      setCustomYMax(yHigh.toFixed(6));
      setUseCustomYDomain(true);
    },
    [maxDataLength],
  );

  // Полный сброс к авто-масштабу и авто-прокрутке.
  const handleResetZoom = useCallback(() => {
    setUseCustomYDomain(false);
    setCustomYMin('');
    setCustomYMax('');
    setIsFollowing(true);
  }, []);

  const handleToggleFollow = useCallback(() => {
    setIsFollowing((prev) => !prev);
  }, []);

  interactionsRef.current.onSelect = handleSelectZoom;
  interactionsRef.current.onReset = handleResetZoom;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Тонкий тулбар: масштаб Y (авто/ручной) + зоны алармов + сброс */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Масштаб Y</span>
          <ButtonGroup size="sm" variant="flat">
            <Button
              color={!useCustomYDomain ? 'primary' : 'default'}
              onPress={() => setUseCustomYDomain(false)}
            >
              Авто
            </Button>
            <Button
              color={useCustomYDomain ? 'primary' : 'default'}
              onPress={() => {
                const u = plotRef.current;
                if (u && u.scales.y.min != null && u.scales.y.max != null && customYMin === '') {
                  setCustomYMin(u.scales.y.min.toFixed(6));
                  setCustomYMax(u.scales.y.max.toFixed(6));
                }
                setUseCustomYDomain(true);
              }}
            >
              Ручной
            </Button>
          </ButtonGroup>

          {useCustomYDomain && (
            <div className="flex items-center gap-1">
              <Input
                aria-label="Y min"
                type="number"
                size="sm"
                value={customYMin}
                onChange={(e) => setCustomYMin(e.target.value)}
                placeholder="min"
                step="0.001"
                className="w-28"
                classNames={{ input: 'font-mono text-xs' }}
              />
              <Input
                aria-label="Y max"
                type="number"
                size="sm"
                value={customYMax}
                onChange={(e) => setCustomYMax(e.target.value)}
                placeholder="max"
                step="0.001"
                className="w-28"
                classNames={{ input: 'font-mono text-xs' }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {alarmZones.length > 0 && (
            <Switch size="sm" isSelected={showAlarmZones} onValueChange={setShowAlarmZones}>
              <span className="text-xs">Зоны алармов</span>
            </Switch>
          )}
          <Tooltip content="Сбросить масштаб (двойной клик по графику)">
            <Button size="sm" variant="flat" isIconOnly onPress={handleResetZoom}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* График — выделите область мышью для увеличения */}
      <div ref={containerRef} style={{ width: '100%', height }} className="cursor-crosshair" />

      {/* Навигация по времени + статус прокрутки */}
      <div className="flex items-center gap-3 flex-wrap">
        {enableZoom && maxDataLength > defaultVisiblePoints && (
          <Slider
            size="sm"
            minValue={0}
            maxValue={Math.max(0, maxDataLength - 1)}
            value={xRange}
            onChange={(val) => {
              setIsFollowing(false);
              setXRange(val as [number, number]);
            }}
            step={1}
            className="flex-1 min-w-[200px]"
            aria-label="Диапазон отображения"
            showTooltip
          />
        )}

        <Button
          size="sm"
          variant="flat"
          color={isFollowing ? 'success' : 'default'}
          startContent={
            isFollowing ? <Radio className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />
          }
          onPress={handleToggleFollow}
        >
          {isFollowing ? 'Онлайн' : 'Пауза'}
        </Button>

        <span className="text-xs text-default-400 whitespace-nowrap">
          {xRange[1] - xRange[0] + 1} точек
        </span>
      </div>
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
