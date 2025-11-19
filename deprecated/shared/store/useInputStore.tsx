"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type IFilePaths = { sensorDataFilePath: string };

type InputStore = {
  inputValues: { [key: string]: string };
  filePaths?: IFilePaths;
  updateInputValue: (key: string, value: string) => void;
  initializeInputValues: (initialValues: { [key: string]: string }) => void;
  setFilePaths: (paths: IFilePaths) => void;
};

const InputContext = createContext<InputStore | undefined>(undefined);

type ProviderProps = {
  children: ReactNode;
  initialInputs?: { [key: string]: string };
  initialFilePaths?: IFilePaths;
};

export const InputProvider: React.FC<ProviderProps> = ({
  children,
  initialInputs = {},
  initialFilePaths,
}) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>(initialInputs);
  const [filePaths, setFilePathsState] = useState<IFilePaths | undefined>(initialFilePaths);

  const updateInputValue = (key: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const initializeInputValues = (initialValues: { [key: string]: string }) => {
    console.log("Initial values:", initialValues);
    setInputValues(initialValues);
  };

  const setFilePaths = (paths: IFilePaths) => {
    setFilePathsState(paths);
  };

  return (
    <InputContext.Provider
      value={{ inputValues, filePaths, updateInputValue, initializeInputValues, setFilePaths }}
    >
      {children}
    </InputContext.Provider>
  );
};

// Хук для использования контекста
export const useInputStore = (): InputStore => {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error("useInputStore must be used within an InputProvider");
  }
  return context;
};
