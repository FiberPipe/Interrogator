import {
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
  ComposedChart,
} from "recharts";
import React from "react";
import { TTransformedData } from "../../types";

type Props = {
  names: string[];
  data: TTransformedData[];
  sensorsConstraints: { [key: string]: string };
};

const lineColorDict = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#387908",
  "#ff7001",
];

export const LineGraph: React.FC<Props> = ({
  names = [],
  data,
  sensorsConstraints,
}) => {
  // Добавление ограничения для отображаемых данных
  const renderedData = data.map((entry) => ({
    ...entry,
    ...sensorsConstraints,
  }));

  console.log("Processed Data for Power Graph:", data, names);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={renderedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Brush dataKey="name" height={30} stroke="#8884d8" />

        {names.map((key, index) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={lineColorDict[index % lineColorDict.length]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
