import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import ConfigProvider from "../ConfigProvider"
import ContractBaseWrapper from "./ContractWrapperBase"

export default class OceanToken extends ContractBaseWrapper {

    public static async getInstance(): Promise<OceanToken> {
        const token: OceanToken = new OceanToken("OceanToken")
        await token.init()
        return token
    }

    public async approve(marketAddress: string, price: number, buyerAddress: string): Promise<Receipt> {
        return this.contract.methods.approve(marketAddress, price)
            .send({
                from: buyerAddress,
                gas: ConfigProvider.getConfig().defaultGas,
            })
    }

    public async balanceOf(address: string): Promise<number> {
        return this.contract.methods.balanceOf(address)
            .call()
            .then((balance: string) => new BigNumber(balance).toNumber())
    }
}
