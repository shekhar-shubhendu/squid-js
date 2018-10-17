import * as EthEcies from "eth-ecies"
import Keeper from "../keeper/Keeper"
import AccessStatus from "../models/AccessStatus"
import Logger from "../utils/Logger"
import Account from "./Account"
import Asset from "./Asset"
import OceanBase from "./OceanBase"

export default class Order extends OceanBase {

    private paid: boolean

    constructor(private asset: Asset, private timeout: number,
                private pubkey: string, private key: any) {
        super()
    }

    public async getStatus(): Promise<AccessStatus> {
        const {auth} = await Keeper.getInstance()
        return auth.getOrderStatus(this.id)
    }

    public setPaid(paid: boolean) {
        this.paid = paid
    }

    public getPaid() {
        return this.paid
    }

    public getTimeout() {
        return this.timeout
    }

    public getKey() {
        return this.key
    }

    public async pay(consumer: Account): Promise<string> {
        const {market} = await Keeper.getInstance()
        Logger.log(
            `Sending payment: ${this.getId()} ${this.asset.publisher.getId()} ${this.asset.price} ${this.timeout}`,
        )
        const payReceipt = await market.payOrder(this, this.asset.publisher.getId(), this.asset.price, consumer.getId())

        return payReceipt.events.PaymentReceived.returnValues._paymentId
    }

    public async commit(accessToken: string) {
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
    }
}
