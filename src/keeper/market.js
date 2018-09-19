import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'

import Logger from '../utils/logger'

export default class OceanMarket extends KeeperBase {
    constructor(web3, network) {
        super(web3, network)

        const instance = this

        return {
            async getInstance() {
                instance.contract = await ContractLoader.load('OceanMarket', instance._network, instance._web3)

                return instance
            }
        }
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
    requestTokens(senderAddress, numTokens) {
        return this.contract.requestTokens(numTokens, { from: senderAddress })
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
