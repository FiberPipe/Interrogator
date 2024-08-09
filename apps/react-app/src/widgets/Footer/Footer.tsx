import { Button } from "@nextui-org/react";
import { useState } from "react";
import html2canvas from "html2canvas";
import classes from "./Footer.module.css";

export const Footer: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);

  const toggleScript = () => {
    if (isRunning) {
      console.log("Script stopped");
    } else {
      console.log("Script started");
    }
    setIsRunning(!isRunning);
  };

  const takeScreenshot = () => {
    html2canvas(document.body).then((canvas: any) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "screenshot.png";
      link.click();
    });
  };

  return (
    <footer className={classes.footer}>
      <Button color="primary" onClick={toggleScript}>
        {isRunning ? "Stop" : "Start"}
      </Button>
      <Button color="secondary" onClick={takeScreenshot}>
        Screenshot
      </Button>
    </footer>
  );
};
