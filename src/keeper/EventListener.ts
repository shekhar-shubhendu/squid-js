import Logger from "../utils/Logger"

export default class EventListener {

    public static async listenOnce(event: any, eventName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            event.watch((error: any, result: any) => {
                event.stopWatching()
                if (error) {
                    Logger.log(`Error in keeper ${eventName} event: `, error)
                    return reject(error)
                }
                resolve(result)
            })
        })
    }

    public static getEvents(event: any): Promise<any[]> {
        return new Promise<any>((resolve, reject) => {
            event.get((error: any, logs: any[]) => {
                if (error) {
                    reject(error)
                    throw new Error(error)
                } else {
                    resolve(logs)
                }
            })
        })
    }
}
