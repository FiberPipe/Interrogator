import { ipcRenderer, IpcRendererEvent } from "electron";
import { Listener } from "../../types/global";

export const subscribtion = {
    subscribe: (channel: string, listener: Listener) => {
        const wrappedListener = (_: IpcRendererEvent, value: string) => {
            listener(value);
        };
        ipcRenderer.on(channel, wrappedListener);
        return wrappedListener;
    },
    unsubscribe: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener);
    },
}