import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import ConfigProvider from "../ConfigProvider"
import Order from "../ocean/Order"
import ContractWrapperBase from "./ContractWrapperBase"

export default class OceanMarket extends ContractWrapperBase {

    public static async getInstance(): Promise<OceanMarket> {
        const market: OceanMarket = new OceanMarket("OceanMarket")
        await market.init()
        return market
    }

    // call functions (costs no gas)
    public async isAssetActive(assetId: string): Promise<boolean> {
        return this.contract.methods.checkAsset(assetId).call()
    }

    public async verifyOrderPayment(orderId: string): Promise<boolean> {
        return this.contract.methods.verifyPaymentReceived(orderId).call()
    }

    public async getAssetPrice(assetId: string): Promise<number> {
        return this.contract.methods.getAssetPrice(assetId)
            .call()
            .then((price: string) => new BigNumber(price).toNumber())
    }

    public async requestTokens(amount: number, receiverAddress: string): Promise<Receipt> {
        return this.contract.methods.requestTokens(amount)
            .send({
                from: receiverAddress,
            })
    }

    public async generateId(input: string): Promise<string> {
        return await this.contract.methods.generateId(input).call()
    }

    public async register(assetId: string, price: number, publisherAddress: string): Promise<Receipt> {
        return await this.contract.methods.register(assetId, price)
            .send({
                from: publisherAddress,
                gas: ConfigProvider.getConfig().defaultGas,
            })
    }

    public async payOrder(order: Order, payerAddreess: string): Promise<Receipt> {

        const args = [
            order.getId(), order.getAsset().publisher.getId(),
            order.getAsset().price, order.getTimeout(),
        ]

        return this.sendTransaction("sendPayment", payerAddreess, args)
    }

    public getAssetPublisher(assetId: string): Promise<string> {
        return this.contract.methods.getAssetPublisher(assetId)
            .call()
    }
}
