import BigNumber = require("bn.js");
import OceanAuth from "./keeper/auth";
import OceanMarket from "./keeper/market";
import OceanToken from "./keeper/token";
import MetaData from "./metadata";
import Config from "./utils/config";
import Logger from "./utils/logger";
import Web3Helper from "./utils/Web3Helper";

export default class Ocean {

    public static async getInstance(config) {

        const ocean = new Ocean(config);

        ocean.market = await OceanMarket.getInstance(config, ocean.helper);
        ocean.auth = await OceanAuth.getInstance(config, ocean.helper);
        ocean.token = await OceanToken.getInstance(config, ocean.helper);

        return ocean;
    }

    public token: OceanToken;
    public market: OceanMarket;
    public auth: OceanAuth;
    public helper: Web3Helper;
    public metadata: MetaData;

    private config: Config;

    private constructor(config: Config) {

        this.config = config;

        this.helper = new Web3Helper(config);
        this.metadata = new MetaData(config);
    }

    public async getAccounts() {
        return Promise.all((await this.helper.getAccounts()).map(async (account: string) => {
            // await ocean.market.requestTokens(account, 1000)
            const {token} = this;
            return {
                name: account,
                balance: {
                    eth: await token.getEthBalance(account),
                    ocn: await token.getTokenBalance(account),
                },
            };
        }));
    }

    public async getOrdersByConsumer(consumerAddress: string) {
        const {auth} = this;
        const accessConsentEvent = auth.contract.AccessConsentRequested({_consumer: consumerAddress}, {
            fromBlock: 0,
            toBlock: "latest",
        });

        let outerResolve = null;
        let outerReject = null;
        const promise = new Promise<any[]>((resolve, reject) => {
            outerResolve = resolve;
            outerReject = reject;
        });

        const getEvents = (): Promise<any[]> => {
            accessConsentEvent.get((error: any, logs: any[]) => {
                if (error) {
                    outerReject(error);
                    throw new Error(error);
                } else {
                    outerResolve(logs);
                }
            });
            return promise;
        };
        const events = await getEvents().then((result) => result);
        // let orders = await this.buildOrdersFromEvents(events, consumerAddress).then((result) => result)
        const orders = events
            .filter((obj: any) => (obj.args._consumer === consumerAddress))
            .map(async (event: any) => ({
                ...event.args,
                timeout: event.args._timeout.toNumber(),
                status: await this.auth.getOrderStatus(event.args._id)
                    .then((status: BigNumber) => status.toNumber()),
                paid: this.market.verifyOrderPayment(event.args._id),
                key: null,
            }));
        Logger.debug("got orders: ", orders);
        return orders;
    }

    public async purchaseAsset(
        assetId: string, publisherId: string, price: number, privateKey: string, publicKey: string, timeout: number,
        senderAddress: string, initialRequestEventHandler, accessCommittedEventHandler, tokenPublishedEventHandler) {
        const {token, market, auth, config} = this;
        try {
            // Allow market contract to transfer funds on the consumer"s behalf
            await token.contract.approve(market.contract.address, price, {from: senderAddress, gas: config.defaultGas});
        } catch (err) {
            Logger.log("token approve", err);
        }
        try {
            // Submit the access request
            await auth.contract.initiateAccessRequest(
                assetId, publisherId, publicKey,
                timeout, {from: senderAddress, gas: 1000000},
            );
        } catch (err) {
            Logger.log("initiateAccessRequest", err);
        }
        const resourceFilter = {_resourceId: assetId, _consumer: senderAddress};
        const initRequestEvent = auth.contract.AccessConsentRequested(resourceFilter);
        let order: any = {};
        this._listenOnce(
            initRequestEvent,
            "AccessConsentRequested",
            (result: any, error: any) => {
                order = initialRequestEventHandler(result, error);
                const requestIdFilter = {_id: order.id};
                const accessCommittedEvent = auth.contract.AccessRequestCommitted(requestIdFilter);
                const tokenPublishedEvent = auth.contract.EncryptedTokenPublished(requestIdFilter);
                this._listenOnce(
                    accessCommittedEvent,
                    "AccessRequestCommitted",
                    (accessRequestCommittedResult: any, accessRequestCommittedError: any) => {
                        accessCommittedEventHandler(accessRequestCommittedResult, order, accessRequestCommittedError);
                    },
                );
                this._listenOnce(
                    tokenPublishedEvent,
                    "EncryptedTokenPublished",
                    (encryptedTokenPublishedResult: any, encryptedTokenPublishedError: any) => {
                        tokenPublishedEventHandler(encryptedTokenPublishedResult, order, encryptedTokenPublishedError);
                    },
                );
            });
        return order;
    }

    // Helper functions (private)
    public _listenOnce(event: any, eventName: string, callback) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        event.watch((error: any, result: any) => {
            event.stopWatching();
            if (error) {
                Logger.log(`Error in keeper ${eventName} event: `, error);
            }
            callback(result, error);
        });
    }
}
