import * as EthCrypto from "eth-crypto"
import * as EthjsUtil from "ethereumjs-util"
import Keeper from "../keeper/Keeper"
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

}
