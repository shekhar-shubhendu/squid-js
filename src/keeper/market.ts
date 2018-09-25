import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'
import Logger from '../utils/logger'
import Web3Helper from "../utils/Web3Helper";
import BigNumber from "bignumber.js";
import Config from "../utils/config";

export default class OceanMarket extends KeeperBase {

    private constructor(config: Config, web3Helper: Web3Helper) {
        super(config, web3Helper)
    }

    public static async getInstance(config: Config, web3Helper: Web3Helper) {

        const market = new OceanMarket(config, web3Helper);
        market.contract = await ContractLoader.load('OceanMarket', market._web3Helper)
        return market;
    }

    // call functions (costs no gas)
    checkAsset(assetId: string) {
        return this.contract.checkAsset(assetId)
    }

    verifyOrderPayment(orderId: string): boolean {
        return this.contract.verifyPaymentReceived(orderId)
    }

    getAssetPrice(assetId: string) {
        return this.contract.getAssetPrice(assetId)
            .then((price: BigNumber) => price.toNumber())
    }

    // Transactions with gas cost
    requestTokens(amount: number, address: string) {
        return this.contract.requestTokens(amount, {from: address})
    }

    async registerAsset(name: string, description: string, price: number, publisherAddress: string) {
        const assetId = await this.contract.generateId(name + description)
        const result = await this.contract.register(
            assetId,
            price, {
                from: publisherAddress, gas:
                this._config.defaultGas
            }
        )
        Logger.log('registered: ', result)
        return assetId
    }

    async payAsset(assetId: string, order: any, publisherAddress: string, senderAddress: string) {
        let assetPrice = await this.contract.getAssetPrice(assetId)
            .then((price: BigNumber) => price.toNumber())
        this.contract.sendPayment(order.id, publisherAddress, assetPrice, order.timeout, {
            from: senderAddress,
            gas: 2000000
        })
    }
}
