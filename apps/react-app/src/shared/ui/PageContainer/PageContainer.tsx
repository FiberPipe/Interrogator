import { ReactNode } from "react";
import classes from "./pageContainer.module.css";

type TPageContainer = {
    children: ReactNode;
}
export const PageContainer: React.FC<TPageContainer> = ({children}) => {
  return <main className={classes.main}>{children}</main>;
};
