import Config from "../models/config";
import ContractHandler from "./ContractHandler";
import Web3Helper from "./Web3Helper";

export default class ContractWrapperBase {

    protected contract: any = null;
    protected config: Config;
    protected web3Helper: Web3Helper;

    private contractName: string;

    constructor(config: Config, contractName: string, web3Helper: Web3Helper) {
        this.config = config;
        this.contractName = contractName;
        this.web3Helper = web3Helper;
    }

    public async init() {
        this.contract = await ContractHandler.get(this.contractName, this.web3Helper);
    }

    public getAddress() {
        return this.contract.address;
    }

    public getEvent(name: string) {
        if (!this.contract.events[name]) {
            throw new Error(`Event ${name} not found on contract ${this.contractName}`);
        }
        return this.contract.events[name];
    }
}
