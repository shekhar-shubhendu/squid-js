import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'

export default class OceanAuth extends KeeperBase {
    constructor(web3, network) {
        super(web3, network)

        return (async () => {
            this.contract = await ContractLoader.load('OceanAuth', this._network, this._web3)
            return this
        })()
    }

    cancelAccessRequest(orderId, senderAddress) {
        return this.contract.cancelAccessRequest(orderId, { from: senderAddress })
    }

    getOrderStatus(orderId) {
        return this.contract.statusOfAccessRequest(orderId)
    }

    getEncryptedAccessToken(orderId, senderAddress) {
        return this.contract.getEncryptedAccessToken(orderId, { from: senderAddress })
    }
}
