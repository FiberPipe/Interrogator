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
  // Состояние выбранных чекбоксов
  const [selectedCharts, setSelectedCharts] = useState<string[]>(names ?? []);

  // Синхронизация выбранных чекбоксов при изменении данных
  useEffect(() => {
    // Фильтруем выбранные чекбоксы, оставляя только те, которые есть в новых данных
    setSelectedCharts((prevSelected) =>
      prevSelected.filter((chartName) => names.includes(chartName))
    );
  }, [names]);

  // Обработчик изменения состояния чекбокса
  const handleCheckboxChange = useCallback(
    (chartName: string, isChecked: boolean) => {
      setSelectedCharts((prev) => {
        if (isChecked) {
          return [...prev, chartName];
        } else {
          return prev.filter((name) => name !== chartName);
        }
      });
    },
    []
  );

  // Фильтрация данных для отображения только выбранных графиков
  const filteredData =
    data &&
    data.map((entry) => {
      const filteredEntry: { [key: string]: number | string } = {
        ...entry,
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
                isSelected={selectedCharts.includes(chartName)}
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