import { BarGraphBuilder } from "../../features";
import { DataFilePathModal } from "../../widgets/DataFilePathModal";
import {useInputStore} from "../../shared";

export const AcquisitionPage: React.FC = () => {
  const {filePaths} = useInputStore()

  return (
   <>
     <DataFilePathModal isOpen={filePaths === undefined} />
     <BarGraphBuilder />
   </>
  );
};
