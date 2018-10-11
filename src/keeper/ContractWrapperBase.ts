import Event from "web3"
import Contract from "web3-eth-contract"
import Config from "../models/Config"
import ContractHandler from "./ContractHandler"
import Web3Helper from "./Web3Helper"

export default class ContractWrapperBase {

    public static async getInstance(config: Config, web3Helper: Web3Helper): Promise<any> {
        // stub
    }

    protected contract: Contract = null
    protected config: Config
    protected web3Helper: Web3Helper

    private contractName: string

    constructor(config: Config, contractName: string, web3Helper: Web3Helper) {
        this.config = config
        this.contractName = contractName
        this.web3Helper = web3Helper
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
        this.contract = await ContractHandler.get(this.contractName, this.web3Helper)
    }

}
