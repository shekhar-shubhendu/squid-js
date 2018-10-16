import Event from "web3"
import Contract from "web3-eth-contract"
import ContractHandler from "./ContractHandler"

export default abstract class ContractWrapperBase {

    protected static instance = null

    protected contract: Contract = null
    private contractName: string

    constructor(contractName) {
        this.contractName = contractName
    }

    public async listenToEventOnce(eventName: string, options: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.contract.events[eventName]) {
                throw new Error(`Event ${eventName} not found on contract ${this.contractName}`)
            }
            this.contract.events[eventName](options, (err) => {
                reject(err)
            })
                .on("data", (eventData: any) => {
                    resolve(eventData)
                })
        })
    }

    public async getEventData(eventName: any, options: any): Promise<Event[]> {
        if (!this.contract.events[eventName]) {
            throw new Error(`Event ${eventName} not found on contract ${this.contractName}`)
        }
        return this.contract.getPastEvents(eventName, options)
    }

    public getAddress() {
        return this.contract.options.address
    }

    protected async init() {
        this.contract = await ContractHandler.get(this.contractName)
    }

    protected async sendTransaction(name: string, from: string, args: any[]) {
        if (!this.contract.methods[name]) {
            throw new Error(`Method ${name} is not part of contract ${this.contractName}`)
        }
        const tx = this.contract.methods[name](...args)
        const gas = await tx.estimateGas(args, {
            from,
        })
        return tx.send({
            from,
            gas,
        })
    }

}
