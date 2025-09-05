import { create } from "zustand";

type IFilePaths = { sensorDataFilePath: string };

type InputStore = {
  inputValues: { [key: string]: string };
  filePaths: IFilePaths | undefined;
  updateInputValue: (key: string, value: string) => void;
  initializeInputValues: (initialValues: { [key: string]: string }) => void;
  setFilePaths: (args: IFilePaths) => void;
};

export const useInputStore = create<InputStore>((set) => ({
  inputValues: {},
  filePaths: undefined,
  updateInputValue: (key, value) =>
    set((state) => {
      if (state.inputValues[key] === value) return state;
      return {
        inputValues: {
          ...state.inputValues,
          [key]: value,
        },
      };
    }),
  initializeInputValues: (initialValues) =>
    set((state) => ({
      inputValues: { ...initialValues, ...state.inputValues },
    })),
  setFilePaths: ({ sensorDataFilePath }) => {
    set(() => ({
      filePaths: { sensorDataFilePath },
    }));
  },
}));
