"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeToFixed = safeToFixed;
function safeToFixed(value, decimals = 6) {
    if (value === null || value === undefined || isNaN(value)) {
        return '—';
    }
    return value.toFixed(decimals);
}
