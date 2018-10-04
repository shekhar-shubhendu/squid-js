import Config from "../models/Config"
import Logger from "../utils/Logger"
import ContractHandler from "./ContractHandler"
import Web3Helper from "./Web3Helper"

export default class ContractWrapperBase {

    protected contract: any = null
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
            this.contract.once(eventName, options, (error: any, eventData: any) => {
                if (error) {
                    Logger.log(`Error in keeper ${eventName} event: `, error)
                    return reject(error)
                }
                resolve(eventData)
            })
        })
    }

    public async getEventData(eventName: any, options: any): Promise<any[]> {
        return new Promise<any>((resolve, reject) => {
            if (!this.contract.events[eventName]) {
                throw new Error(`Event ${eventName} not found on contract ${this.contractName}`)
            }
            this.contract.events[eventName](options)
                .on("data", (eventData: any[]) => {
                    Logger.log(eventData)
                    resolve(eventData)
                })
                .on("error", (error) => {
                    return reject(error)
                })
        })
    }

    public async init() {
        this.contract = await ContractHandler.get(this.contractName, this.web3Helper)
    }

    public getAddress() {
        return this.contract.address
    }

}
