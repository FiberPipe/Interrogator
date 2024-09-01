import { BarGraphBuilder } from "../../features";
import { DataFilePathModal } from "../../widgets/DataFilePathModal";

export const AcquisitionPage: React.FC = () => {
  return (
    <>
      <DataFilePathModal />
      <BarGraphBuilder />
    </>
  );
};
