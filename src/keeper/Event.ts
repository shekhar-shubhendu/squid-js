import GenericContract from "./contracts/GenericContract"
import EventListener from "./EventListener"

export default class Event {

    private poller
    private lastBlock: number = 0
    private interval: number = 200

    constructor(private contractName: string,
                private eventName: string,
                private filter: any) {

    }

    public stopListen() {
        clearTimeout(this.poller)
    }

    public listen(callback: any) {
        this.poller = setTimeout(
            () => this.handler(callback),
            this.interval)
    }

    public async listenOnce() {
        this.listen((events: any[]) => {
            EventListener.unsubscribe(this)
            return events
        })
    }

    private async handler(callback: any) {
        const contract = await
            GenericContract.getInstance(this.contractName)
        const events = await
            contract.getEventData(this.eventName, {
                filter: this.filter,
                fromBlock: this.lastBlock,
                toBlock: "latest",
            })

        this.lastBlock = events[events.length - 1].blockNumber
        callback(events)
    }
}
