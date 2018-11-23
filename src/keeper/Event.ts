import GenericContract from "./contracts/GenericContract"
import EventListener from "./EventListener"
import Web3Provider from "./Web3Provider"

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

    public async listen(callback: any) {
        this.lastBlock = await Web3Provider.getWeb3().eth.getBlockNumber() + 1

        this.poller = setInterval(
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
        const contract = await GenericContract.getInstance(this.contractName)

        const events = await contract.getEventData(this.eventName, {
            filter: this.filter,
            fromBlock: this.lastBlock,
            toBlock: "latest",
        })

        if (events.length > 0) {
            this.lastBlock = events[events.length - 1].blockNumber + 1
            callback(events)
        }
    }
}
