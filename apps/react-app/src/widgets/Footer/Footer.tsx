import { Button } from "@nextui-org/react";
import classes from "./Footer.module.css";

export const Footer: React.FC = () => {
  return (
    <footer className={classes.footer}>
      <Button color="primary">Start</Button>
      <Button color="primary">Stop</Button>
      <Button></Button>
    </footer>
  );
};
