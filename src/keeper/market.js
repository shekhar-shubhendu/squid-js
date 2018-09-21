import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'

import Logger from '../utils/logger'

export default class OceanMarket extends KeeperBase {
    constructor(web3Helper) {
        super(web3Helper)

        return (async () => {
            this.contract = await ContractLoader.load('OceanMarket', this._web3Helper)
            return this
        })()
    }

    // call functions (costs no gas)
    checkAsset(assetId) {
        return this.contract.checkAsset(assetId)
    }

    verifyOrderPayment(orderId) {
        return this.contract.verifyPaymentReceived(orderId)
    }

    getAssetPrice(assetId) {
        return this.contract.getAssetPrice(assetId)
            .then((price) => price.toNumber())
    }

    // Transactions with gas cost
    requestTokens(amount, address) {
        return this.contract.requestTokens(amount, { from: address })
    }

    async registerAsset(name, description, price, publisherAddress) {
        const assetId = await this.contract.generateId(name + description)
        const result = await this.contract.register(
            assetId,
            price,
            { from: publisherAddress, gas: this.defaultGas }
        )
        Logger.log('registered: ', result)
        return assetId
    }

    async payAsset(assetId, order, publisherAddress, senderAddress) {
        let assetPrice = await this.contract.getAssetPrice(assetId).then((price) => price.toNumber())
        this.contract.sendPayment(order.id, publisherAddress, assetPrice, order.timeout, {
            from: senderAddress,
            gas: 2000000
        })
    }
}
