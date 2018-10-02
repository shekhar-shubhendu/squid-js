export default class Logger {
    public static log(...args: any[]) {
        Logger.dispatch("log", ...args);
    }

    public static debug(...args: any[]) {
        Logger.dispatch("debug", ...args);
    }

    public static warn(...args: any[]) {
        Logger.dispatch("warn", ...args);
    }

    public static error(...args: any[]) {
        Logger.dispatch("error", ...args);
    }

    private static dispatch(verb: string, ...args: any[]) {
        console[verb](...args);
    }
}