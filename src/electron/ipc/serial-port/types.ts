export enum SerialChannels {
  GetPorts = "serial:getPorts",
  Open = "serial:open",
  Close = "serial:close",
  Data = "serial:data",
  Closed = "serial:closed",
}

export enum AppChannels {
  Ready = "app:ready",
  SettingsGet = "app:settings:get",
  SettingsSet = "app:settings:set",
}
