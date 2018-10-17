import * as EthCrypto from "eth-crypto"
import EthEcies from "eth-ecies"
import * as EthjsUtil from "ethereumjs-util"
import JWT from "jsonwebtoken"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Logger from "../utils/Logger"
import Account from "./Account"
import OceanBase from "./OceanBase"
import Order from "./Order"

declare var fetch

export default class Asset extends OceanBase {

    public static async load(assetId): Promise<Asset> {
        const {market} = await Keeper.getInstance()

        const asset = new Asset("unknown", "unknown",
            await market.getAssetPrice(assetId),
            new Account(await market.getAssetPublisher(assetId)))

        asset.setId(assetId)

        return asset
    }

    constructor(public name: string,
                public description: string,
                public price: number,
                public publisher: Account) {
        super()
    }

    public async isActive(): Promise<boolean> {
        const {market} = await Keeper.getInstance()
        return market.isAssetActive(this.getId())
    }

    public async purchase(account: Account, timeout: number): Promise<Order> {
        const {token, market, auth} = await Keeper.getInstance()

        const key = EthCrypto.createIdentity()
        const publicKey = EthjsUtil.privateToPublic(key.privateKey).toString("hex")
        const price = await market.getAssetPrice(this.getId())
        const isValid = await market.isAssetActive(this.getId())

        Logger.log("The asset:", this.getId(), "is it valid?", isValid, "it's price is:", price)

        if (!isValid) {
            throw new Error("The Asset is not valid!")
        }
        try {
            const marketAddr = market.getAddress()
            // Allow market contract to transfer funds on the consumer"s behalf
            await token.approve(marketAddr, price, account.getId())
            Logger.log(`${price} tokens approved on market with id: ${marketAddr}`)
        } catch (err) {
            Logger.error("token.approve failed", err)
        }
        let order: Order
        try {
            // Submit the access request
            const initiateAccessRequestReceipt = await auth.initiateAccessRequest(this,
                publicKey, timeout, account.getId())

            const {returnValues} = initiateAccessRequestReceipt.events.AccessConsentRequested
            Logger.log(`Keeper AccessConsentRequested event received on asset: ${this.getId()}`)
            order = new Order(this, returnValues._timeout, returnValues._pubKey, key)
            order.setId(returnValues._id)
        } catch (err) {
            Logger.error("auth.initiateAccessRequest failed", err)
        }

        return order
        if (false) {
            // todo: AccessRequestCommitted event is not emitted in this flow
            await auth.listenToEventOnce(
                "AccessRequestCommitted", {
                    filter: {
                        _id: order.getId(),
                    },
                })
                .then((accessRequestCommittedResult) => {
                    Logger.log("Got AccessRequestCommitted Event")

                    return order.pay(account)
                })
                .then((payAssetReceipt) => {
                    return auth.listenToEventOnce(
                        "EncryptedTokenPublished", {
                            filter: {
                                _id: order.getId(),
                            },
                        })
                })
                .then((encryptedTokenPublishedResult) => {
                    Logger.log("Got EncryptedTokenPublished Event")

                    const {returnValues} = encryptedTokenPublishedResult

                    return this.finalizePurchaseAsset(
                        returnValues._id, order, key, account,
                    )
                })
        }
    }

    public async finalizePurchaseAsset(accessId: string, order: Order, key: any, account: Account): Promise<Order> {
        const {auth} = await Keeper.getInstance()

        const encryptedAccessToken = await auth.getEncryptedAccessToken(accessId, this.getId())

        // grab the access token from acl contract
        const tokenNo0x = encryptedAccessToken.slice(2)
        const encryptedTokenBuffer = Buffer.from(tokenNo0x, "hex")

        const privateKey = key.privateKey.slice(2)
        const accessTokenEncoded = EthEcies.Decrypt(Buffer.from(privateKey, "hex"), encryptedTokenBuffer)
        const accessToken = JWT.decode(accessTokenEncoded) // Returns a json object

        // sign it
        const hexEncrToken = `0x${encryptedTokenBuffer.toString("hex")}`

        const signature = Web3Provider.getWeb3().eth.sign(account.getId(), hexEncrToken)
        const fixedMsgSha = Web3Provider.getWeb3().utils.sha3(encryptedAccessToken)

        // Download the data set from the provider using the url in the access token
        // decode the access token, grab the service_endpoint, request_id,

        // payload keys: ['consumerId', 'fixed_msg', 'sigEncJWT', 'jwt']
        const payload = JSON.stringify({
            consumerId: account.getId(),
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
        order.setAccessUrl(accessUrl)

        return order
    }
}
