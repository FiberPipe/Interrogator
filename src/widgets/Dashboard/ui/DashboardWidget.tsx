// DashboardWidget.tsx
import { Card, CardBody, Chip } from '@heroui/react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';

// ---- Mock SCADA calendar data ----
const generateCalendarData = () => {
  const today = new Date();
  return Array.from({ length: 120 }, (_, i) => {
    const date = subDays(today, i);
    const value = Math.round(Math.random() * 100);

    return {
      date: format(date, 'yyyy-MM-dd'),
      value,
      alerts: value > 80
        ? ['Critical overload', 'Sensor instability']
        : value > 50
        ? ['Warning: drift detected']
        : [],
    };
  });
};

const data = generateCalendarData();

export const DashboardWidget = () => {
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  const selectedAlerts = useMemo(() => selectedDay?.alerts ?? [], [selectedDay]);

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      {/* Calendar Heatmap */}
      <Card>
        <CardBody className="space-y-4">
          <h3 className="text-lg font-semibold">System Activity Calendar</h3>

          <CalendarHeatmap
            startDate={subDays(new Date(), 120)}
            endDate={new Date()}
            values={data}
            classForValue={(value) => {
              if (!value || value.value === 0) return 'color-empty';
              if (value.value > 80) return 'color-github-4';
              if (value.value > 50) return 'color-github-3';
              if (value.value > 20) return 'color-github-2';
              return 'color-github-1';
            }}
            onClick={(value) => value && setSelectedDay(value)}
            tooltipDataAttrs={(value: any) => ({
              'data-tip': value
                ? `${value.date}: ${value.value}`
                : 'No data',
            })}
          />

          {/* Legend */}
          <div className="flex gap-2 text-xs items-center">
            <span className="text-default-500">Low</span>
            <div className="w-3 h-3 bg-green-200 rounded" />
            <div className="w-3 h-3 bg-green-400 rounded" />
            <div className="w-3 h-3 bg-yellow-400 rounded" />
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-default-500">High</span>
          </div>
        </CardBody>
      </Card>

      {/* Alerts for selected day */}
      <Card>
        <CardBody className="space-y-3">
          <h3 className="text-lg font-semibold">Daily Alerts</h3>

          {selectedDay ? (
            selectedAlerts.length > 0 ? (
              selectedAlerts.map((alert: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Chip color="danger" size="sm">ALERT</Chip>
                  <span className="text-sm">{alert}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-default-500">No alerts for this day</p>
            )
          ) : (
            <p className="text-sm text-default-400">Select a day on the calendar</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

/*
Add once globally (e.g. index.css):

.color-empty { fill: #ebedf0; }
.color-github-1 { fill: #9be9a8; }
.color-github-2 { fill: #40c463; }
.color-github-3 { fill: #f9c74f; }
.color-github-4 { fill: #f94144; }
*/
