import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { TooltipComponent, LegendComponent } from 'echarts/components';

// Регистрация необходимых компонентов
echarts.use([
  GridComponent,
  LineChart,
  SVGRenderer,
  UniversalTransition,
  TooltipComponent,
  LegendComponent
]);

interface EChartsOption {
  xAxis: {
    type: string;
    data: string[];
    boundaryGap: boolean;
  };
  yAxis: {
    type: string;
    min: number | 'dataMin';
    max: number | 'dataMax';
    scale: boolean;
  };
  series: Array<{
    data: number[];
    type: string;
    lineStyle?: {
      type?: string;
      width?: number;
    };
    itemStyle?: {
      color?: string;
    };
    label?: {
      show: boolean;
      position: string;
      formatter?: string | Function;
    };
    name?: string;
    markPoint?: {
      data: Array<{
        type: string;
        label: {
          formatter: string | Function;
        };
      }>;
    };
  }>;
  grid: {
    left: string;
    right: string;
    top: string;
    bottom: string;
    containLabel: boolean;
  };
  tooltip: {
    trigger: string;
  };
  legend: {
    show: boolean;
  };
}

export const HorizontalBargraph: React.FC = (data: any) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, null, {
      renderer: 'svg'
    });

    const firstSeriesData = [];
    const otherSeriesData = [
      [1540.184],
      [1540.996],
      [1541.78],
      [1542.592]
    ];

    // Создаем массив всех значений для расчета min/max
    const allValues = [
      ...firstSeriesData,
      ...otherSeriesData.flat()
    ];

    // Находим min и max значения с небольшим отступом
    const minValue = Math.floor(Math.min(...allValues));
    const maxValue = Math.ceil(Math.max(...allValues));

    const option: EChartsOption = {
      xAxis: {
        type: 'category',
        data: [],
        boundaryGap: false, // Убираем отступы по краям для минимизации пустот
      },
      yAxis: {
        type: 'value',
        min: firstSeriesData.some(val => val < 1000) ? 'dataMin' : minValue, // Автоматический min для смешанных данных
        max: 'dataMax', // Автоматический max
        scale: true, // Более точный масштаб
      },
      grid: {
        left: '3%',
        right: '4%',
        top: '3%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: false // Скрываем легенду, так как она не требуется
      },
      series: [
        {
          name: 'Series 1',
          data: firstSeriesData,
          type: 'line',
          lineStyle: {
            type: 'dashed', // Делаем линию пунктирной
            width: 2
          },
          itemStyle: {
            color: '#FF0000' // Красный цвет для первой линии
          },
          label: {
            show: true, // Показываем значения на графике
            position: 'top',
            formatter: '{c}' // Отображаем текущее значение
          },
          // Добавляем метку максимального значения для первой серии
          markPoint: {
            data: [
              {
                type: 'max',
                label: {
                  formatter: '{c}'
                }
              }
            ]
          }
        },
        ...otherSeriesData.map((data, index) => ({
          data: data,
          type: 'line',
          name: `Series ${index + 2}`,
          lineStyle: {
            type: 'dashed' // Делаем все линии пунктирными
          }
        }))
      ]
    };

    //@ts-ignore
    chart.setOption(option);

    // Обработчик изменения размера окна
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

