import * as EthEcies from "eth-ecies"
import * as JWT from "jsonwebtoken"
import AquariusProvider from "../aquarius/AquariusProvider"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import AccessStatus from "../models/AccessStatus"
import Logger from "../utils/Logger"
import Account from "./Account"
import Asset from "./Asset"
import OceanBase from "./OceanBase"

export default class Order extends OceanBase {

    constructor(private asset: Asset, private timeout: number,
                private pubkey: string, private key: any) {
        super()
    }

    public async getStatus(): Promise<AccessStatus> {
        const {auth} = await Keeper.getInstance()
        return auth.getOrderStatus(this.id)
    }

    public async pay(consumer: Account): Promise<string> {
        const {market} = await Keeper.getInstance()
        Logger.log(
            `Sending payment: ${this.getId()} ${this.asset.publisher.getId()} ${this.asset.price} ${this.timeout}`,
        )
        const payReceipt =
            await market.payOrder(this, this.asset.publisher.getId(), this.asset.price, consumer.getId(), this.timeout)

        return payReceipt.events.PaymentReceived.returnValues._paymentId
    }

    public async commit(accessToken: string): Promise<boolean> {
        const {auth} = await Keeper.getInstance()
        const commitAccessRequestReceipt = await auth.commitAccessRequest(this, this.asset.publisher.getId())
        if (commitAccessRequestReceipt.events.AccessRequestRejected) {

            const {returnValues} = commitAccessRequestReceipt.events.AccessRequestRejected
            throw new Error(`commitAccessRequest failed ${JSON.stringify(returnValues, null, 2)}`)
        }

        const pubKey = await auth.getTempPubKey(this.getId())

        if (this.pubkey !== pubKey) {
            throw new Error("Pubkey missmatch")
        }

        const encryptedAccessToken =
            EthEcies.encrypt(new Buffer(pubKey, "hex"), new Buffer(accessToken)).toString("hex")

        await auth.deliverAccessToken(this.getId(), `0x${encryptedAccessToken}`, this.asset.publisher.getId())

        return true
    }

    public async consume(consumer: Account): Promise<string> {
        const {auth} = await Keeper.getInstance()

        const encryptedAccessToken = await auth.getEncryptedAccessToken(this.getId(), consumer.getId())

        // grab the access token from acl contract
        const tokenNo0x = encryptedAccessToken.slice(2)
        const encryptedTokenBuffer = Buffer.from(tokenNo0x, "hex")

        const privateKey = this.key.privateKey.slice(2)
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

        const accessUrl = await AquariusProvider.getAquarius().getAccessUrl(accessToken, payload)

        Logger.log("consume url: ", accessUrl)

        return accessUrl
    }

}
