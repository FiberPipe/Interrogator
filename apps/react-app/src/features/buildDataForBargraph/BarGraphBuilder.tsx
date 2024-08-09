import React from "react";
import { BarGraph } from "../../shared/ui/BarGraph";

export const BarGraphBuilder: React.FC = () => {
  const data: any = [
    {
      id: 1,
      time: "00:00:07.359",
      wavelength: 1558.728,
      displacement: -7.5e-5,
      potPin1: 0.220919,
      potPin2: 0.151515,
    },
    {
      id: 2,
      time: "00:00:07.359",
      wavelength: 1558.725,
      displacement: -7.5e-5,
      potPin1: 0.220919,
      potPin2: 0.151515,
    },
  ];


  return <BarGraph data={data} />;
};
