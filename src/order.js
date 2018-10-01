import KeeperBase from './keeper/keeper-base'

export default class Order extends KeeperBase {
    constructor(web3Helper, market, token, auth) {
        super(web3Helper)
        this.market = market
        this.token = token
        this.auth = auth
        return (async () => {
            return this
        })()
    }

    buyService(serviceDID, publisherId, price, timeout, senderAddress, initialRequestEventHandler,
        accessCommittedEventHandler, tokenPublishedEventHandler) {
        // Allow market contract to transfer funds on the consumer's behalf
        const { token, market, auth } = this
        token.contract.approve(market.address, price, { from: senderAddress, gas: 2000000 })
        // Submit the access request
        auth.contract.initiateAccessRequest(
            serviceDID, publisherId, timeout, { from: senderAddress, gas: 1000000 }
        )

        const resourceFilter = { _resourceId: serviceDID, _consumer: senderAddress }
        const initRequestEvent = auth.contract.AccessConsentRequested(resourceFilter)
        let order = {}
        this._listenOnce(
            initRequestEvent,
            'AccessConsentRequested',
            (result, error) => {
                order = initialRequestEventHandler(result, error)
                const requestIdFilter = { _id: order.id }
                const accessCommittedEvent = auth.contract.AccessRequestCommitted(requestIdFilter)
                const tokenPublishedEvent = auth.contract.EncryptedTokenPublished(requestIdFilter)
                this._listenOnce(
                    accessCommittedEvent,
                    'AccessRequestCommitted',
                    (result, error) => {
                        accessCommittedEventHandler(result, order, error)
                    }
                )
                this._listenOnce(
                    tokenPublishedEvent,
                    'EncryptedTokenPublished',
                    (result, error) => {
                        tokenPublishedEventHandler(result, order, error)
                    }
                )
            })
        return order
    }
}
