import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import Asset from "../models/Asset"
import Config from "../models/Config"
import Order from "../models/Order"
import Logger from "../utils/Logger"
import ContractWrapperBase from "./ContractWrapperBase"
import Web3Helper from "./Web3Helper"

export default class OceanMarket extends ContractWrapperBase {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {

        const market = new OceanMarket(config, "OceanMarket", web3Helper)
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
                gas: this.config.defaultGas,
            })
    }

    public async payAsset(asset: Asset, order: Order, buyerAddress: string): Promise<Receipt> {
        return this.contract.methods.sendPayment(order.id, asset.publisherId, asset.price, order.timeout)
            .send({
                from: buyerAddress,
                gas: this.config.defaultGas,
            })
    }
}
