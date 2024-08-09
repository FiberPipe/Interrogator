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
import { TTransformedData } from "../../types";

type Props = {
  names: string[] | number[];
  data: TTransformedData[];
};

export const LineGraph: React.FC<Props> = ({ names = [], data }) => {
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
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Legend />
        <Brush dataKey="name" height={30} stroke="#8884d8" />
        {names.map((line: string | number) => (
          <Line
            key={line}
            type="monotone"
            dataKey={line}
            stroke={lineColorDict[Number(line) % 20]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
