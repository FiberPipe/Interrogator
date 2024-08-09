import { Checkbox } from "@nextui-org/react";
import { useState, useCallback } from "react";
import classes from "./LineGraphWithCheckbox.module.css";
import { LineGraph } from "../../shared/ui/LineGraph/LineGraph";

interface LineGraphWithCheckboxProps {
  data: any[];
  names: any[];
}

export const LineGraphWithCheckbox: React.FC<LineGraphWithCheckboxProps> = ({
  data,
  names,
}) => {
  const [selectedCharts, setSelectedCharts] = useState<any>(names);

  const handleCheckboxChange = useCallback(
    (chartNum: number, isChecked: boolean) => {
      setSelectedCharts((prev: any) => {
        if (isChecked) {
          return [...prev, chartNum];
        } else {
          return prev.filter((num: any) => num !== chartNum);
        }
      });
    },
    []
  );

  const filteredData = data.map((entry) => {
    const filteredEntry: { [key: string]: number | string } = {
      name: entry.name,
    };
    selectedCharts.forEach((chartNum: any) => {
      if (entry[chartNum]) {
        filteredEntry[chartNum] = entry[chartNum];
      }
    });
    return filteredEntry;
  });

  console.log("peter", filteredData);

  return (
    <>
      <div className={classes.chartsWidget}>
        <div className={classes.toggler}>
          {names.map((chartNum: any) => (
            <Checkbox
              key={chartNum}
              isSelected={selectedCharts.includes(chartNum)}
              onChange={(e) => handleCheckboxChange(chartNum, e.target.checked)}
              size="md"
            >
              {chartNum}
            </Checkbox>
          ))}
        </div>
        <div className={classes.charts}>
          <LineGraph names={names} data={filteredData} />
        </div>
      </div>
    </>
  );
};
