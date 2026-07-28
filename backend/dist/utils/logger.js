"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }
    static info(message, meta) {
        console.log(Logger.formatMessage(LogLevel.INFO, message, meta));
    }
    static warn(message, meta) {
        console.warn(Logger.formatMessage(LogLevel.WARN, message, meta));
    }
    static error(message, error) {
        const errMeta = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
        console.error(Logger.formatMessage(LogLevel.ERROR, message, errMeta));
    }
    static debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(Logger.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
}
exports.Logger = Logger;
