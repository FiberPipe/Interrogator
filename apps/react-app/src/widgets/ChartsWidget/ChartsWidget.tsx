import { Button } from "@nextui-org/react";
import classes from "./ChartsWidget.module.css";
import { LineGraph } from "../../shared/ui/LineGraph/LineGraph";

export const ChartsWidget: React.FC = () => {
  return (
    <>
      <div className={classes.chartsWidget}>
        <div className={classes.toggler}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((chartNum: number) => (
            <Button variant="bordered" key={chartNum} size="sm">
              {chartNum}
            </Button>
          ))}
        </div>
        <div className={classes.charts}>
          <LineGraph />
        </div>
      </div>
    </>
  );
};
