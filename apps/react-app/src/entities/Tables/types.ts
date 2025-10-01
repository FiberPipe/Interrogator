import { ReceivedData } from "../../shared";

export interface GroupedItem {
  id: number;
  rangeMin: number;
  rangeMax: number;
}
export interface GroupedWavelengthItem extends GroupedItem{
  wavelength: number;
};

export interface GroupedPowerItem extends GroupedItem {
  currentValue: number;
};

export interface TableProps {
  body: ReceivedData[];
  inputValues: Record<string, string>;
  handleInputChange: (key: string, value: string) => Promise<void>
} 