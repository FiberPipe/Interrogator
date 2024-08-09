import React from "react";
import { BarGraph } from "../../shared/ui/BarGraph";
import { TBarGraphTransformedData, TData } from "../../shared";
import { data } from "./utils";

export const BarGraphBuilder: React.FC = () => {

  const modifiedData = data.map((d: TData): TBarGraphTransformedData => {
    return { name: d.id, value: d.potPin1 / d.potPin2 };
  });

  return <BarGraph data={modifiedData} />;
};
