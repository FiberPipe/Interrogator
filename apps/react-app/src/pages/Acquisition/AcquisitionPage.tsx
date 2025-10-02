import React from "react";
import { BarGraphBuilder } from "../../features";
import { PortPickerModal } from "./PickerModal";

export const AcquisitionPage: React.FC = () => {
  const [showPortPicker, setShowPortPicker] = React.useState(true);

  return (
    <React.Fragment>
      <BarGraphBuilder />
      <PortPickerModal
        open={showPortPicker}
        onClose={() => setShowPortPicker(false)}
      />
    </React.Fragment>

  );
};
