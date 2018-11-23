import GenericContract from "./contracts/GenericContract"

export default class Event {

    private poller
    private lastBlock: number = 0

    constructor(private contractName: string,
                private eventName: string,
                private filter: any) {

    }

    public stopListen() {
        clearTimeout(this.poller)
    }

    public listen(callback: any) {
        this.poller = setTimeout(() => this.handler(callback), 200)
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
