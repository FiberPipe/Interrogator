import { LineGraphWithCheckbox } from "../../entities";
import { data, transformData } from "./utils";

export const LineGraphDataBuilder: React.FC = () => {
  const transformedData = transformData(data);
  return <LineGraphWithCheckbox names={[1, 2]} data={transformedData} />;
};
