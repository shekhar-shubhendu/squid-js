import Web3 from 'web3'
import ContractLoader from './keeper/contractLoader'
import Logger from './utils/logger'

const DEFAULT_GAS = 300000

export default class OceanKeeper {
    constructor(uri, network) {
        const web3Provider = new Web3.providers.HttpProvider(uri)
        this.web3 = new Web3(web3Provider)
        this.defaultGas = DEFAULT_GAS
        this.network = network || 'development'

        Logger.warn('OceanKeeper is deprecated use the Ocean object from squid instead')
    }

    async initContracts() {
        this.oceanToken = await ContractLoader.load('OceanToken', this.network, this.web3)
        this.oceanMarket = await ContractLoader.load('OceanMarket', this.network, this.web3)
        this.oceanAuth = await ContractLoader.load('OceanAuth', this.network, this.web3)

        return {
            oceanToken: this.oceanToken,
            oceanMarket: this.oceanMarket,
            oceanAuth: this.oceanAuth
        }
    }

    // web3 wrappers
    sign(accountAddress, message) {
        return this.web3.eth.sign(accountAddress, message)
    }

    getMessageHash(message) {
        return this.web3.sha3(`\x19Ethereum Signed Message:\n${message.length}${message}`)
    }

    // call functions (costs no gas)
    checkAsset(assetId) {
        return this.oceanMarket.checkAsset(assetId)
    }

    getBalance(accountAddress) {
        return this.oceanToken.balanceOf.call(accountAddress)
    }

    getAssetPrice(assetId) {
        return this.oceanMarket.getAssetPrice(assetId).then((price) => price.toNumber())
    }

    getOrderStatus(orderId) {
        return this.oceanAuth.statusOfAccessRequest(orderId)
    }

    verifyOrderPayment(orderId) {
        return this.oceanMarket.verifyPaymentReceived(orderId)
    }

    getEncryptedAccessToken(orderId, senderAddress) {
        return this.oceanAuth.getEncryptedAccessToken(orderId, { from: senderAddress })
    }

    async getConsumerOrders(consumerAddress) {
        let accessConsentEvent = this.oceanAuth.AccessConsentRequested({ _consumer: consumerAddress }, {
            fromBlock: 0,
            toBlock: 'latest'
        })

        let _resolve = null
        let _reject = null
        const promise = new Promise((resolve, reject) => {
            _resolve = resolve
            _reject = reject
        })

        const getEvents = () => {
            accessConsentEvent.get((error, logs) => {
                if (error) {
                    _reject(error)
                    throw new Error(error)
                } else {
                    _resolve(logs)
                }
            })
            return promise
        }
        const events = await getEvents().then((events) => events)
        // let orders = await this.buildOrdersFromEvents(events, consumerAddress).then((result) => result)
        let orders = events
            .filter(obj => (obj.args._consumer === consumerAddress))
            .map(async (event) => ({
                ...event.args,
                timeout: event.args._timeout.toNumber(),
                status: await this.getOrderStatus(event.args._id).then((status) => status.toNumber()),
                paid: await this.verifyOrderPayment(event.args._id).then((received) => received),
                key: null
            }))
        Logger.debug('got orders: ', orders)
        return orders
    }

    // Transactions with gas cost
    requestTokens(senderAddress, numTokens) {
        return this.oceanMarket.requestTokens(numTokens, { from: senderAddress })
    }

    async registerDataAsset(name, description, price, publisherAddress) {
        const assetId = await this.oceanMarket.generateId(name + description)
        const result = await this.oceanMarket.register(
            assetId,
            price,
            { from: publisherAddress, gas: this.defaultGas }
        )
        Logger.log('registered: ', result)
        return assetId
    }

    async sendPayment(assetId, order, publisherAddress, senderAddress) {
        let assetPrice = await this.oceanMarket.getAssetPrice(assetId).then((price) => price.toNumber())
        this.oceanMarket.sendPayment(order.id, publisherAddress, assetPrice, order.timeout, {
            from: senderAddress,
            gas: 2000000
        })
    }

    cancelAccessRequest(orderId, senderAddress) {
        return this.oceanAuth.cancelAccessRequest(orderId, { from: senderAddress })
    }

    orchestrateResourcePurchase(
        assetId, publisherId, price, privateKey, publicKey, timeout, senderAddress,
        initialRequestEventHandler, accessCommittedEventHandler, tokenPublishedEventHandler) {
        const { oceanToken, oceanMarket, oceanAuth } = this
        // Allow OceanMarket contract to transfer funds on the consumer's behalf
        oceanToken.approve(oceanMarket.address, price, { from: senderAddress, gas: 2000000 })
        // Submit the access request
        oceanAuth.initiateAccessRequest(
            assetId, publisherId, publicKey,
            timeout, { from: senderAddress, gas: 1000000 }
        )

        const resourceFilter = { _resourceId: assetId, _consumer: senderAddress }
        const initRequestEvent = oceanAuth.AccessConsentRequested(resourceFilter)
        let order = {}
        this._listenOnce(
            initRequestEvent,
            'AccessConsentRequested',
            (result, error) => {
                order = initialRequestEventHandler(result, error)
                const requestIdFilter = { _id: order.id }
                const accessCommittedEvent = oceanAuth.AccessRequestCommitted(requestIdFilter)
                const tokenPublishedEvent = oceanAuth.EncryptedTokenPublished(requestIdFilter)
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

    // Helper functions (private)
    _listenOnce(event, eventName, callback) {
        event.watch((error, result) => { // eslint-disable-line security/detect-non-literal-fs-filename
            event.stopWatching()
            if (error) {
                Logger.log(`Error in keeper ${eventName} event: `, error)
            }
            callback(result, error)
        })
    }
}
