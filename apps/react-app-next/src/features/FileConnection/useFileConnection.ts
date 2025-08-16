import { FilePaths } from "@app/types/global";
import { useFileInput } from "@gravity-ui/uikit";
import { useCallback } from "react";

export type DBStatus = 'loading' | 'connect' | 'disconnect';

interface UseFileConnectionProps {
  setFilePaths: (args: FilePaths) => void
}
export const useFileConnection = ({ setFilePaths }: UseFileConnectionProps) => {

  const onUpdate = useCallback(async (files: File[]) => {
    const sensorDataFilePath = files[0].path || '';

    const result = await window.electron.setFilePaths({ sensorDataFilePath }).then((data: FilePaths) => { setFilePaths?.({ sensorDataFilePath }); return data });
  }, [setFilePaths]);

  const {
    controlProps,
    triggerProps
  } = useFileInput({
    onUpdate
  });


  return { controlProps, triggerProps, };
}