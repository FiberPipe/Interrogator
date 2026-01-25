"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBetaBuild = exports.isProductionBuild = exports.getBuildChannel = exports.getAppVersion = void 0;
const version_config_json_1 = __importDefault(require("../../../version.config.json"));
const getAppVersion = () => {
    const channel = process.env.BUILD_CHANNEL || 'alpha';
    return version_config_json_1.default[channel].version;
};
exports.getAppVersion = getAppVersion;
const getBuildChannel = () => {
    return process.env.BUILD_CHANNEL || 'alpha';
};
exports.getBuildChannel = getBuildChannel;
const isProductionBuild = () => {
    return (0, exports.getBuildChannel)() === 'alpha';
};
exports.isProductionBuild = isProductionBuild;
const isBetaBuild = () => {
    return (0, exports.getBuildChannel)() === 'beta';
};
exports.isBetaBuild = isBetaBuild;
