import * as EthCrypto from "eth-crypto";
import EthEcies from "eth-ecies";
import * as EthjsUtil from "ethereumjs-util";
import JWT from "jsonwebtoken";
import EventListener from "../keeper/EventListener";
import Keeper from "../keeper/Keeper";
import Asset from "../models/Asset";
import OrderModel from "../models/Order";
import Logger from "../utils/Logger";

declare var fetch;

export default class Order {

    private static create(asset: Asset, args, key): OrderModel {
        Logger.log("keeper AccessConsentRequested event received on asset: ", asset.assetId, "\nevent:", args);
        const accessId = args._id;
        Logger.log("got new access request id: ", accessId);
        return {
            id: accessId,
            assetId: asset.assetId,
            asset,
            timeout: args._timeout,
            pubkey: args._pubKey,
            key,
        } as OrderModel;
    }

    private keeper: Keeper;

    constructor(keeper: Keeper) {
        this.keeper = keeper;
    }

    public async getOrdersByConsumer(consumerAddress: string) {
        const {auth, market} = this.keeper;
        const accessConsentEvent = auth.getEvent("AccessConsentRequested")({
            _consumer: consumerAddress,
        }, {
            fromBlock: 0,
            toBlock: "latest",
        });

        const events = await EventListener.getEvents(accessConsentEvent);

        const orders = await Promise.all(events
            .filter((event: any) => (event.args._consumer === consumerAddress))
            .map(async (event: any) => ({
                ...event.args,
                timeout: event.args._timeout.toNumber(),
                status: await auth.getOrderStatus(event.args._id),
                paid: await market.verifyOrderPayment(event.args._id),
                key: null,
            } as Order)));
        Logger.log("Got orders: ", orders);
        return orders;
    }

    public async purchaseAsset(asset: Asset, timeout: number, buyerAddress: string): Promise<OrderModel> {
        const {token, market, auth} = this.keeper;

        const key = EthCrypto.createIdentity();
        const publicKey = EthjsUtil.privateToPublic(key.privateKey).toString("hex");
        const price = await market.getAssetPrice(asset.assetId);
        const isValid = await market.isAssetActive(asset.assetId);

        Logger.log("The asset:", asset.assetId, "is it valid?", isValid, "it's price is:", price);

        if (!isValid) {
            throw new Error("asset not valid");
        }
        try {
            // Allow market contract to transfer funds on the consumer"s behalf
            await token.approve(market.getAddress(), price, buyerAddress);
        } catch (err) {
            Logger.log("token approve", err);
        }
        try {
            // Submit the access request
            await auth.initiateAccessRequest(asset, publicKey, timeout, buyerAddress);
        } catch (err) {
            Logger.log("initiateAccessRequest", err);
        }
        const resourceFilter = {
            _resourceId: asset.assetId,
            _consumer: buyerAddress,
        };
        // todo: Event - implement proper eventing
        const accessConsentRequestedEvent = auth.getEvent("AccessConsentRequested")(resourceFilter);
        let order: OrderModel;
        const finalOrder: OrderModel = await EventListener.listenOnce(
            accessConsentRequestedEvent,
            "AccessConsentRequested")
            .then((accessConsentRequestedResult) => {
                order = Order.create(asset, accessConsentRequestedResult.args, key);
                const requestIdFilter = {
                    _id: order.id,
                };
                // todo: Event - implement proper eventing
                const accessCommittedEvent = auth.getEvent("AccessRequestCommitted")(requestIdFilter);

                return EventListener.listenOnce(accessCommittedEvent, "AccessRequestCommitted");
            })
            .then((accessRequestCommittedResult) => {
                return this.payAsset(asset, accessRequestCommittedResult.args, order, buyerAddress);
            })
            .then(() => {
                const requestIdFilter = {
                    _id: order.id,
                };
                // todo: Event - implement proper eventing
                const tokenPublishedEvent = auth.getEvent("EncryptedTokenPublished")(requestIdFilter);
                return EventListener.listenOnce(tokenPublishedEvent, "EncryptedTokenPublished");
            })
            .then((result) => {
                return this.finalizePurchaseAsset(
                    result, order, key, buyerAddress,
                );
            });

        return finalOrder;
    }

    private async payAsset(asset: Asset, args, order, buyerAddress) {
        const {market} = this.keeper;

        // send payment
        Logger.log("Sending payment: ", order.id, args._id, asset.publisherId, asset.price, order.timeout);
        return market.payAsset(asset, order, buyerAddress);
    }

    private async finalizePurchaseAsset(args, order, key, buyerAddress): Promise<OrderModel> {
        const {auth, web3Helper} = this.keeper;

        // Logger.log('keeper EncryptedTokenPublished event received: ', order.id, eventResult.args)

        const encryptedAccessToken = await auth.getEncryptedAccessToken(args._id, buyerAddress);

        // grab the access token from acl contract
        const tokenNo0x = encryptedAccessToken.slice(2);
        const encryptedTokenBuffer = Buffer.from(tokenNo0x, "hex");

        const privateKey = key.privateKey.slice(2);
        const accessTokenEncoded = EthEcies.Decrypt(Buffer.from(privateKey, "hex"), encryptedTokenBuffer);
        const accessToken = JWT.decode(accessTokenEncoded); // Returns a json object

        // sign it
        const hexEncrToken = `0x${encryptedTokenBuffer.toString("hex")}`;

        const signature = web3Helper.sign(buyerAddress, hexEncrToken);
        const fixedMsgSha = web3Helper.getWeb3().utils.sha3(encryptedAccessToken);

        // Download the data set from the provider using the url in the access token
        // decode the access token, grab the service_endpoint, request_id,

        // payload keys: ['consumerId', 'fixed_msg', 'sigEncJWT', 'jwt']
        const payload = JSON.stringify({
            consumerId: buyerAddress,
            fixed_msg: fixedMsgSha,
            sigEncJWT: signature,
            jwt: accessTokenEncoded,
        });
        const accessUrl = await fetch(`${accessToken.service_endpoint}/${accessToken.resource_id}`, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
            .then((response: any) => {
                if (response.ok) {
                    return response.text();
                }
                Logger.log("Failed: ", response.status, response.statusText);
            })
            .then((consumptionUrl: string) => {
                Logger.log("Success accessing consume endpoint: ", consumptionUrl);
                return consumptionUrl;
            })
            .catch((error) => {
                Logger.error("Error fetching the data asset consumption url: ", error);
            });
        Logger.log("consume url: ", accessUrl);
        order.accessUrl = accessUrl;

        return order;
    }
}
