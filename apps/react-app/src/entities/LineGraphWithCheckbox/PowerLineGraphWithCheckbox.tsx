import { Checkbox } from "@nextui-org/react";
import React, { useState, useCallback, useEffect } from "react";
import classes from "./LineGraphWithCheckbox.module.css";
import { TTransformedData } from "../../shared";
import { LineGraph } from "../../shared/ui/LineGraph/PowerLineGraph";

interface LineGraphWithCheckboxProps {
  data: TTransformedData[];
  names: string[];
}

export const LineGraphWithCheckbox: React.FC<LineGraphWithCheckboxProps> = ({
  data,
  names,
}) => {
  const [selectedCharts, setSelectedCharts] = useState<string[]>(names ?? []);

  useEffect(() => {
    setSelectedCharts(names);
  }, [names]);

  const handleCheckboxChange = useCallback(
    (chartName: string, isChecked: boolean) => {
      setSelectedCharts((prev) => {
        console.log(1234321, prev);
        if (isChecked) {
          return [...prev, chartName];
        } else {
          return prev.filter((name) => name !== chartName);
        }
      });
    },
    []
  );

  const filteredData =
    data &&
    data.map((entry) => {
      const filteredEntry: { [key: string]: number | string } = {
        ...entry
      };

      selectedCharts &&
        selectedCharts.forEach((chartName) => {
          if (entry[chartName] !== undefined) {
            filteredEntry[chartName] = entry[chartName];
          }
        });

      return filteredEntry;
    });

  console.log("peterr333", data, filteredData, selectedCharts);

  return (
    <>
      <div className={classes.chartsWidget}>
        <div className={classes.toggler}>
          {names &&
            names.map((chartName) => (
              <Checkbox
                key={chartName}
                isSelected={
                  selectedCharts && selectedCharts.includes(chartName)
                }
                onChange={(e) =>
                  handleCheckboxChange(chartName, e.target.checked)
                }
                size="md"
              >
                {chartName}
              </Checkbox>
            ))}
        </div>
        <div className={classes.charts}>
          <LineGraph
            names={selectedCharts}
            data={filteredData as TTransformedData[]}
            sensorsConstraints={{}}
          />
        </div>
      </div>
    </>
  );
};
