import { useEffect } from "react";
import { BarGraphBuilder } from "../../features/buildDataForBargraph/BarGraphBuilder";

export const AcquisitionPage: React.FC = () => {
  const fileUrl = "./current.txt";
  // return <BarGraphBuilder />;
  useEffect(() => {
    // readLastLinesFromFile('../../../../../packages/data-generator/current.txt', 10)
  }, [fileUrl]);

  return <div>Файл загружен. Проверьте консоль для содержимого.</div>;
};
