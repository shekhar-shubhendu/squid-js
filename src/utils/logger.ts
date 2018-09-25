export default class Logger {
    static dispatch(verb: string, ...args: any[]) {
        /* eslint-disable-next-line no-console */
        // @ts-ignore
        console[verb](...args)
    }

    static log(...args: any[]) {
        Logger.dispatch('log', ...args)
    }

    static debug(...args: any[]) {
        Logger.dispatch('debug', ...args)
    }

    static warn(...args: any[]) {
        Logger.dispatch('warn', ...args)
    }

    static error(...args: any[]) {
        Logger.dispatch('error', ...args)
    }
}
