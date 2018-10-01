import Web3 from 'web3'
import OceanMarket from './keeper/market'
import OceanAuth from './keeper/auth'
import OceanToken from './keeper/token'
import Logger from './utils/logger'
import Web3Helper from './utils/Web3Helper'
import MetaData from './metadata'

const DEFAULT_GAS = 300000

export default class Ocean {
    constructor(config) {
        const web3Provider = config.web3Provider || new Web3.providers.HttpProvider(config.nodeUri)
        this._web3 = new Web3(web3Provider)
        this._defaultGas = config.gas || DEFAULT_GAS
        this._providerUri = config.providerUri || null

        this.helper = new Web3Helper(this._web3)
        this.metadata = new MetaData(this._providerUri)

        return (async () => {
            this._network = config.network || (await this.helper.getNetworkName()).toLowerCase() || 'development'

            this.market = await new OceanMarket(this.helper)
            this.auth = await new OceanAuth(this.helper)
            this.token = await new OceanToken(this.helper)

            return this
        })()
    }

    async getOrdersByConsumer(consumerAddress) {
        let accessConsentEvent = this.auth.contract.AccessConsentRequested({ _consumer: consumerAddress }, {
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
                status: await this.auth.getOrderStatus(event.args._id).then((status) => status.toNumber()),
                paid: await this.market.verifyOrderPayment(event.args._id).then((received) => received),
                key: null
            }))
        Logger.debug('got orders: ', orders)
        return orders
    }

    // Helper functions (private)
    _listenOnce(event, eventName, callback) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        event.watch((error, result) => {
            event.stopWatching()
            if (error) {
                Logger.log(`Error in keeper ${eventName} event: `, error)
            }
            callback(result, error)
        })
    }

    // The new interface

    requestTokens(numTokens) {
        return this.market.requestTokens(numTokens, { from: this.getCurrentAccount() })
    }

    getMessageHash(message) {
        return this._web3.utils.sha3(message)
    }

    async generateDID(content) {
        return 'did:ocn:' + (await this.market.generateId(content)).toString()
    }
}
