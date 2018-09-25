import OceanMarket from './keeper/market'
import OceanAuth from './keeper/auth'
import OceanToken from './keeper/token'
import Logger from './utils/logger'
import Web3Helper from './utils/Web3Helper'
import MetaData from './metadata'
import BigNumber = require("bn.js")
import Config from "./utils/config";

export default class Ocean {

    private _config: Config;

    public token: OceanToken;
    public market: OceanMarket;
    public auth: OceanAuth;
    public helper: Web3Helper;
    public metadata: MetaData;

    private constructor(config: Config) {

        this._config = config;

        this.helper = new Web3Helper(config)
        this.metadata = new MetaData(config)
    }

    public static async getInstance(config) {

        const ocean = new Ocean(config);

        ocean.market = await OceanMarket.getInstance(config, ocean.helper)
        ocean.auth = await OceanAuth.getInstance(config, ocean.helper)
        ocean.token = await OceanToken.getInstance(config, ocean.helper)

        return ocean;
    }

    async getAccounts() {
        return Promise.all((await this.helper.getAccounts()).map(async (account: string) => {
            // await ocean.market.requestTokens(account, 1000)

            return {
                name: account,
                balance: {
                    ocn: await this.token.getTokenBalance(account),
                    eth: await this.token.getEthBalance(account)
                }
            }
        }))
    }

    async getOrdersByConsumer(consumerAddress: string) {
        let accessConsentEvent = this.auth.contract.AccessConsentRequested({_consumer: consumerAddress}, {
            fromBlock: 0,
            toBlock: 'latest'
        })

        let _resolve: Function = null
        let _reject: Function = null
        const promise = new Promise<any[]>((resolve, reject) => {
            _resolve = resolve
            _reject = reject
        })

        const getEvents = (): Promise<any[]> => {
            accessConsentEvent.get((error: any, logs: any[]) => {
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
            .filter((obj: any) => (obj.args._consumer === consumerAddress))
            .map(async (event: any) => ({
                ...event.args,
                timeout: event.args._timeout.toNumber(),
                status: await this.auth.getOrderStatus(event.args._id)
                    .then((status: BigNumber) => status.toNumber()),
                paid: this.market.verifyOrderPayment(event.args._id),
                key: null
            }))
        Logger.debug('got orders: ', orders)
        return orders
    }

    async purchaseAsset(
        assetId: string, publisherId: string, price: number, privateKey: string, publicKey: string, timeout: number, senderAddress: string,
        initialRequestEventHandler: Function, accessCommittedEventHandler: Function, tokenPublishedEventHandler: Function) {
        const {token: OceanToken, market: OceanMarket, auth} = this
        try {
            // Allow market contract to transfer funds on the consumer's behalf
            await this.token.contract.approve(this.market.contract.address, price, {from: senderAddress, gas: 2000000})
        } catch (err) {
            Logger.log('token approve', err)
        }
        try {
            // Submit the access request
            await auth.contract.initiateAccessRequest(
                assetId, publisherId, publicKey,
                timeout, {from: senderAddress, gas: 1000000}
            )
        } catch (err) {
            Logger.log('initiateAccessRequest', err)
        }
        const resourceFilter = {_resourceId: assetId, _consumer: senderAddress}
        const initRequestEvent = auth.contract.AccessConsentRequested(resourceFilter)
        let order: any = {}
        this._listenOnce(
            initRequestEvent,
            'AccessConsentRequested',
            (result: any, error: any) => {
                order = initialRequestEventHandler(result, error)
                const requestIdFilter = {_id: order.id}
                const accessCommittedEvent = auth.contract.AccessRequestCommitted(requestIdFilter)
                const tokenPublishedEvent = auth.contract.EncryptedTokenPublished(requestIdFilter)
                this._listenOnce(
                    accessCommittedEvent,
                    'AccessRequestCommitted',
                    (result: any, error: any) => {
                        accessCommittedEventHandler(result, order, error)
                    }
                )
                this._listenOnce(
                    tokenPublishedEvent,
                    'EncryptedTokenPublished',
                    (result: any, error: any) => {
                        tokenPublishedEventHandler(result, order, error)
                    }
                )
            })
        return order
    }

    // Helper functions (private)
    _listenOnce(event: any, eventName: string, callback: Function) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        event.watch((error: any, result: any) => {
            event.stopWatching()
            if (error) {
                Logger.log(`Error in keeper ${eventName} event: `, error)
            }
            callback(result, error)
        })
    }
}
