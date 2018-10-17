import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import ContractBaseWrapper from "./ContractWrapperBase"

export default class OceanToken extends ContractBaseWrapper {

    public static async getInstance(): Promise<OceanToken> {
        const token: OceanToken = new OceanToken("OceanToken")
        await token.init()
        return token
    }

    public async approve(marketAddress: string, price: number, buyerAddress: string): Promise<Receipt> {
        return this.sendTransaction("approve", buyerAddress, [marketAddress, price])
    }

    public async balanceOf(address: string): Promise<number> {
        return this.call("balanceOf", [address])
            .then((balance: string) => new BigNumber(balance).toNumber())
    }
}
