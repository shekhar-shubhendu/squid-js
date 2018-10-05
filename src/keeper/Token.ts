import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import Config from "../models/Config"
import ContractBaseWrapper from "./ContractWrapperBase"
import Web3Helper from "./Web3Helper"

export default class OceanToken extends ContractBaseWrapper {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {
        const token = new OceanToken(config, "OceanToken", web3Helper)
        await token.init()
        return token
    }

    public async approve(marketAddress: string, price: number, buyerAddress: string): Promise<Receipt> {
        return this.contract.methods.approve(marketAddress, price)
            .send({
                from: buyerAddress,
                gas: this.config.defaultGas,
            })
    }

    public async balanceOf(address: string): Promise<number> {
        return this.contract.methods.balanceOf(address)
            .call()
            .then((balance: string) => new BigNumber(balance).toNumber())
    }
}
