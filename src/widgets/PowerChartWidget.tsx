import { Card } from "@heroui/react";
import { LineChartWithConfidence } from "../shared/ui";

const sampleSeries = Array.from({ length: 5 }, (_, i) => ({
  key: `p${i + 1}`,
  label: `P${i + 1}`,
  data: Array.from({ length: 100 }, (_, j) => ({
    x: j,
    y: Math.sin((j + i) / 10) * 10 + 50,
    yMin: Math.sin((j + i) / 10) * 10 + 50 - 3,
    yMax: Math.sin((j + i) / 10) * 10 + 50 + 3,
  })),
  color: ["#4f46e5","#e11d48","#059669","#f97316","#8b5cf6"][i],
  showConfidence: true,
}));

export const PowerChartWidget = () => {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">Power (P)</h3>
      <p className="text-sm text-default-500">
        Множественные линии мощности с выбором отображаемых и настройкой доверительного интервала.
      </p>

      <LineChartWithConfidence series={sampleSeries} />
    </Card>
  );
};
