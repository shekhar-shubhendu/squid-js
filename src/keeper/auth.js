import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'

export default class OceanAuth extends KeeperBase {
    constructor(web3Helper) {
        super(web3Helper)

        return (async () => {
            this.contract = await ContractLoader.load('OceanAuth', this._web3Helper)
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
