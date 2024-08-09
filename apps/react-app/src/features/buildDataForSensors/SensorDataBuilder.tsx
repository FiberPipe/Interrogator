import { data } from "./utils";
import { FBGDataTable, WLDataTable } from "../../entities";
import { Tab, Tabs } from "@nextui-org/react";

export const SensorDataBuilder = () => {
  return (
    <>
      <Tabs aria-label="type">
        <Tab key="Wabelength" title="Wavelength">
          <WLDataTable body={data} />
        </Tab>
        <Tab key="FBG" title="FBG">
          <FBGDataTable body={data} />
        </Tab>
      </Tabs>
    </>
  );
};
