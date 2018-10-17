import * as EthCrypto from "eth-crypto"
import * as EthEcies from "eth-ecies"
import * as EthjsUtil from "ethereumjs-util"
import * as JWT from "jsonwebtoken"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import ProviderProvider from "../provider/ProviderProvider"
import Logger from "../utils/Logger"
import Account from "./Account"
import OceanBase from "./OceanBase"
import Order from "./Order"

export default class Asset extends OceanBase {

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

    public async purchase(consumer: Account, timeout: number): Promise<Order> {
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
            await token.approve(marketAddr, price, consumer.getId())
            Logger.log(`${price} tokens approved on market with id: ${marketAddr}`)
        } catch (err) {
            Logger.error("token.approve failed", err)
        }
        let order: Order
        try {
            // Submit the access request
            const initiateAccessRequestReceipt = await auth.initiateAccessRequest(this,
                publicKey, timeout, consumer.getId())

            const {returnValues} = initiateAccessRequestReceipt.events.AccessConsentRequested
            Logger.log(`Keeper AccessConsentRequested event received on asset: ${this.getId()}`)
            order = new Order(this, returnValues._timeout, returnValues._pubKey, key)
            order.setId(returnValues._id)
        } catch (err) {
            Logger.error("auth.initiateAccessRequest failed", err)
        }

        return order
    }

    public async consume(order: Order, consumer: Account): Promise<string> {
        const {auth} = await Keeper.getInstance()

        const encryptedAccessToken = await auth.getEncryptedAccessToken(order.getId(), consumer.getId())

        // grab the access token from acl contract
        const tokenNo0x = encryptedAccessToken.slice(2)
        const encryptedTokenBuffer = Buffer.from(tokenNo0x, "hex")

        const privateKey = order.getKey().privateKey.slice(2)
        const accessTokenEncoded: string =
            EthEcies.decrypt(Buffer.from(privateKey, "hex"), encryptedTokenBuffer).toString()
        const accessToken = JWT.decode(accessTokenEncoded) // Returns a json object

        if (!accessToken) {
            throw new Error(`AccessToken is not an jwt: ${accessTokenEncoded}`)
        }

        const signature = Web3Provider.getWeb3().eth.sign(encryptedAccessToken, consumer.getId())
        const encryptedAccessTokenSha3 = Web3Provider.getWeb3().utils.sha3(encryptedAccessToken)

        // Download the data set from the provider using the url in the access token
        // decode the access token, grab the service_endpoint, request_id,

        // payload keys: ['consumerId', 'fixed_msg', 'sigEncJWT', 'jwt']
        const payload = JSON.stringify({
            consumerId: consumer.getId(),
            fixed_msg: encryptedAccessTokenSha3,
            sigEncJWT: signature,
            jwt: accessTokenEncoded,
        })

        const accessUrl = await ProviderProvider.getProvider().getAccessUrl(accessToken, payload)

        Logger.log("consume url: ", accessUrl)

        return accessUrl
    }
}
