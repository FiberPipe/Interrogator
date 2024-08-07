import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
} from "recharts";
import { lineColorDict } from "./const";
import { useState } from "react";

type TData = {
  name: string;
  [key: number]: string | number;
};

type DataPoint = {
  name: string;
  [key: string]: number | string; // Позволяет любым числовым значениям быть в объекте
};

export const LineGraph = () => {
  const data: TData[] = [
    {
      name: "Page A",
      1: 4000,
      2: 2400,
      3: 1300,
      4: 4000,
    },
    {
      name: "Page B",
      1: 3000,
      2: 1398,
      3: 1300,
      4: 4000,
    },
    {
      name: "Page C",
      1: 2000,
      2: 9800,
      3: 1300,
      4: 4000,
    },
    {
      name: "Page D",
      1: 2780,
      2: 3908,
      3: 1300,
      4: 4000,
    },
    {
      name: "Page E",
      1: 1890,
      2: 4800,
      3: 1300,
      4: 4000,
    },
    {
      name: "Page F",
      1: 2390,
      2: 3800,
      3: 1300,
      4: 4000,
    },
    {
      name: "Page G",
      1: 3490,
      2: 4300,
      3: 1300,
      4: 4000,
    },
  ];

  const lines = [1, 2, 3, 4];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Brush dataKey="name" height={30} stroke="#8884d8" />{" "}
        {lines.map((line) => (
          <Line
            key={line}
            type="monotone"
            dataKey={line}
            stroke={lineColorDict[line % 20]}
            strokeWidth={2} // Задаем толщину линии
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
