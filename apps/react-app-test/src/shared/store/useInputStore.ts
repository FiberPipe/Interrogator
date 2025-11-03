import create from "zustand";

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
    set((state) => ({
      inputValues: { ...state.inputValues, [key]: value },
    })),
  initializeInputValues: (initialValues) => {
    console.log("Initial values:", initialValues);
    set({ inputValues: initialValues });
  },
  setFilePaths: ({ sensorDataFilePath }) => {
    set(() => ({
      filePaths: { sensorDataFilePath },
    }));
  },
}));
