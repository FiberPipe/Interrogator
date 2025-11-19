"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppChannels = exports.SerialChannels = void 0;
var SerialChannels;
(function (SerialChannels) {
    SerialChannels["GetPorts"] = "serial:getPorts";
    SerialChannels["Open"] = "serial:open";
    SerialChannels["Close"] = "serial:close";
    SerialChannels["Data"] = "serial:data";
    SerialChannels["Closed"] = "serial:closed";
})(SerialChannels || (exports.SerialChannels = SerialChannels = {}));
var AppChannels;
(function (AppChannels) {
    AppChannels["Ready"] = "app:ready";
    AppChannels["SettingsGet"] = "app:settings:get";
    AppChannels["SettingsSet"] = "app:settings:set";
})(AppChannels || (exports.AppChannels = AppChannels = {}));
