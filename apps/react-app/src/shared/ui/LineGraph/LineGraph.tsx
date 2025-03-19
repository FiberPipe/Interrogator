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
import { lineColorDict } from "./const";
import { TTransformedData } from "../../types";
import React, { useEffect } from "react";

type Props = {
  names: string[] | number[];
  data: TTransformedData[];
  sensorsConstraints: { [key: string]: string };
};

const calculateNumericAverages = (data: TTransformedData[]) => {
  const sums: { [key: string]: number } = {};
  const counts: { [key: string]: number } = {};

  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      //@ts-ignore
      const value = parseFloat(entry[key]);
      if (!isNaN(value)) {
        if (!sums[key]) {
          sums[key] = 0;
          counts[key] = 0;
        }
        sums[key] += value;
        counts[key] += 1;
      }
    });
  });

  const averages: { [key: string]: number } = {};
  Object.keys(sums).forEach(
    (key) => (averages[`avg_${key}`] = sums[key] / counts[key])
  );

  return averages;
};

const getConstraintKey = (id: number | string, type: "max" | "min") =>
  `wl_${id}_${type}`;

const getAvgKey = (id: number | string) => `avg_${id}`;

export const LineGraph: React.FC<Props> = ({
  names = [],
  data,
  sensorsConstraints,
}) => {
  const averageValues = calculateNumericAverages(data);
  const renderedData = data.map((entry) => ({
    ...entry,
    ...sensorsConstraints,
    ...averageValues,
  }));

  useEffect(() => {
    console.log(
      "Средние арифметические значения добавлены в данные:",
      renderedData
    );
  }, [renderedData]);

  // console.log('peterr111', renderedData)
  return (
    <ResponsiveContainer width="100%" height={"100%"}>
      <ComposedChart
        width={500}
        height={300}
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
        {names.map((key: string | number) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={lineColorDict[Number(key) % 20]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        ))}

        {names.map((key: string | number) => (
          <Line
            key={getConstraintKey(key, "max")}
            dataKey={getConstraintKey(key, "max")}
            type="monotone"
            stroke={lineColorDict[Number(key) % 20]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            strokeDasharray={"5 5"}
          />
        ))}

        {names.map((key: string | number) => (
          <Line
            key={getConstraintKey(key, "min")}
            dataKey={getConstraintKey(key, "min")}
            type="monotone"
            stroke={lineColorDict[Number(key) % 20]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            strokeDasharray={"5 5"}
          />
        ))}

        {names.map((key: string | number) => (
          <Line
            key={getAvgKey(key)}
            dataKey={getAvgKey(key)}
            type="monotone"
            stroke={lineColorDict[Number(key) % 20]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            strokeDasharray={"5 5"}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
