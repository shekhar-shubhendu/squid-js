import * as EthCrypto from "eth-crypto"
import EthEcies from "eth-ecies"
import * as EthjsUtil from "ethereumjs-util"
import JWT from "jsonwebtoken"
import Asset from "../models/Asset"
import OrderModel from "../models/Order"
import Logger from "../utils/Logger"
import OceanBase from "./OceanBase"

declare var fetch

export default class Order extends OceanBase {

    private static create(asset: Asset, args, key): OrderModel {
        const accessId = args._id
        Logger.log(`got new access request id: ${accessId}`)
        const order: OrderModel = {
            id: accessId,
            assetId: asset.assetId,
            asset,
            timeout: parseInt(args._timeout, 10),
            pubkey: args._pubKey,
            key,
        } as OrderModel
        // Logger.log("Created order", order)

        return order
    }

    public async getOrdersByConsumer(consumerAddress: string): Promise<OrderModel[]> {
        const {auth, market} = this.keeper

        Logger.log("Getting orders")

        const accessConsentRequestedData = await auth.getEventData(
            "AccessConsentRequested", {
                filter: {
                    _consumer: consumerAddress,
                },
                fromBlock: 0,
                toBlock: "latest",
            })

        const orders = await Promise.all(
            accessConsentRequestedData
                .filter((event: any) => {
                    return event.returnValues._consumer === consumerAddress
                })
                // todo: this is not orders model maybe? lacking proper typing here
                .map(async (event: any) => ({
                            id: event.returnValues._id,
                            asset: null,
                            assetId: event.returnValues._resourceId,
                            timeout: parseInt(event.returnValues._timeout, 10),
                            pubkey: null,
                            key: null,
                            status: await auth.getOrderStatus(event.returnValues._id),
                            paid: await market.verifyOrderPayment(event.returnValues._id),
                        } as OrderModel
                    ),
                ),
        )

        // Logger.log("Got orders:", JSON.stringify(orders, null, 2))
        Logger.log(`Got ${Object.keys(orders).length} orders`)

        return orders
    }

    public async purchaseAsset(asset: Asset, timeout: number, buyerAddress: string): Promise<OrderModel> {
        const {token, market, auth} = this.keeper

        const key = EthCrypto.createIdentity()
        const publicKey = EthjsUtil.privateToPublic(key.privateKey).toString("hex")
        const price = await market.getAssetPrice(asset.assetId)
        const isValid = await market.isAssetActive(asset.assetId)

        Logger.log("The asset:", asset.assetId, "is it valid?", isValid, "it's price is:", price)

        if (!isValid) {
            throw new Error("The Asset is not valid!")
        }
        try {
            const marketAddr = market.getAddress()
            // Allow market contract to transfer funds on the consumer"s behalf
            await token.approve(marketAddr, price, buyerAddress)
            Logger.log(`${price} tokens approved on market with id: ${marketAddr}`)
        } catch (err) {
            Logger.error("token.approve failed", err)
        }
        let order: OrderModel
        try {
            // Submit the access request
            const initiateAccessRequestReceipt = await auth.initiateAccessRequest(asset,
                publicKey, timeout, buyerAddress)

            const args = initiateAccessRequestReceipt.events.AccessConsentRequested.returnValues
            Logger.log(`keeper AccessConsentRequested event received on asset: ${asset.assetId}`)
            order = Order.create(asset, args, key)
        } catch (err) {
            Logger.error("auth.initiateAccessRequest failed", err)
        }

        return order
        if (false) {
            // todo: AccessRequestCommitted event is not emitted in this flow
            const finalOrder: OrderModel = await auth.listenToEventOnce(
                "AccessRequestCommitted", {
                    filter: {
                        _id: order.id,
                    },
                })
                .then((accessRequestCommittedResult) => {
                    Logger.log("Got AccessRequestCommitted Event")

                    return this.payAsset(asset, accessRequestCommittedResult.returnValues, order, buyerAddress)
                })
                .then((payAssetReceipt) => {
                    return auth.listenToEventOnce(
                        "EncryptedTokenPublished", {
                            filter: {
                                _id: order.id,
                            },
                        })
                })
                .then((result) => {
                    Logger.log("Got EncryptedTokenPublished Event")

                    return this.finalizePurchaseAsset(
                        result, order, key, buyerAddress,
                    )
                })
        }
    }

    private async payAsset(asset: Asset, args, order, buyerAddress) {
        const {market} = this.keeper

        // send payment
        Logger.log("Sending payment: ", order.id, args._id, asset.publisherId, asset.price, order.timeout)
        return market.payAsset(asset, order, buyerAddress)
    }

    private async finalizePurchaseAsset(args, order, key, buyerAddress): Promise<OrderModel> {
        const {auth, web3Helper} = this.keeper

        const encryptedAccessToken = await auth.getEncryptedAccessToken(args._id, buyerAddress)

        // grab the access token from acl contract
        const tokenNo0x = encryptedAccessToken.slice(2)
        const encryptedTokenBuffer = Buffer.from(tokenNo0x, "hex")

        const privateKey = key.privateKey.slice(2)
        const accessTokenEncoded = EthEcies.Decrypt(Buffer.from(privateKey, "hex"), encryptedTokenBuffer)
        const accessToken = JWT.decode(accessTokenEncoded) // Returns a json object

        // sign it
        const hexEncrToken = `0x${encryptedTokenBuffer.toString("hex")}`

        const signature = web3Helper.sign(buyerAddress, hexEncrToken)
        const fixedMsgSha = web3Helper.getWeb3().utils.sha3(encryptedAccessToken)

        // Download the data set from the provider using the url in the access token
        // decode the access token, grab the service_endpoint, request_id,

        // payload keys: ['consumerId', 'fixed_msg', 'sigEncJWT', 'jwt']
        const payload = JSON.stringify({
            consumerId: buyerAddress,
            fixed_msg: fixedMsgSha,
            sigEncJWT: signature,
            jwt: accessTokenEncoded,
        })
        const accessUrl = await fetch(`${accessToken.service_endpoint}/${accessToken.resource_id}`, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
            .then((response: any) => {
                if (response.ok) {
                    return response.text()
                }
                Logger.log("Failed: ", response.status, response.statusText)
            })
            .then((consumptionUrl: string) => {
                Logger.log("Success accessing consume endpoint: ", consumptionUrl)
                return consumptionUrl
            })
            .catch((error) => {
                Logger.error("Error fetching the data asset consumption url: ", error)
            })
        Logger.log("consume url: ", accessUrl)
        order.accessUrl = accessUrl

        return order
    }
}
