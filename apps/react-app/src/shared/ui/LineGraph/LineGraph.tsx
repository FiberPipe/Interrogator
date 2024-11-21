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
import React from "react";

type Props = {
  names: string[] | number[];
  data: TTransformedData[];
  sensorsConstraints: { [key: string]: string };
};

const getConstraintKey = (id: number| string, type: 'max' | 'min') => `wl_${id}_${type}`

export const LineGraph: React.FC<Props> = ({ names = [], data, sensorsConstraints }) => {
  const renderedData = data.map(entry => ({...entry, ...sensorsConstraints}));

  return (
   <ResponsiveContainer width="100%" height={'100%'}>
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
       key={getConstraintKey(key, 'max')}
       dataKey={getConstraintKey(key, 'max')}
       type="monotone"
       stroke={lineColorDict[Number(key) % 20]}
       strokeWidth={2}
       activeDot={{ r: 8 }}
       strokeDasharray={'5 5'}
      />
     ))}

     {names.map((key: string | number) => (
      <Line
       key={getConstraintKey(key, 'min')}
       dataKey={getConstraintKey(key, 'min')}
       type="monotone"
       stroke={lineColorDict[Number(key) % 20]}
       strokeWidth={2}
       activeDot={{ r: 8 }}
       strokeDasharray={'5 5'}
      />
     ))}
    </ComposedChart>
   </ResponsiveContainer>
  );
};
