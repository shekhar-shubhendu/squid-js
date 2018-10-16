import Keeper from "../keeper/Keeper"
import Logger from "../utils/Logger"
import Asset from "./Asset"
import OceanBase from "./OceanBase"
import Account from "./Account"

export default class Order extends OceanBase {

    private paid: boolean
    private status: number
    private accessUrl: string
    private accessId: string

    constructor(private asset: Asset, private timeout: number,
                private pubkey: string, private key: any) {
        super()
    }

    public setAccessUrl(url: string) {
        this.accessUrl = url
    }

    public getAccessUrl() {
        return this.accessUrl
    }

    public setStatus(status: number) {
        this.status = status
    }

    public setAccessId(accessId: string) {
        Logger.log("accessId", accessId)
        this.accessId = accessId
    }

    public getStatus() {
        return this.status
    }

    public setPaid(paid: boolean) {
        this.paid = paid
    }

    public getPaid() {
        return this.paid
    }

    public getAsset() {
        return this.asset
    }

    public getPubkey() {
        return this.pubkey
    }

    public getTimeout() {
        return this.timeout
    }

    public getKey() {
        return this.key
    }

    public async pay(account: Account) {
        const {market} = await Keeper.getInstance()
        // send payment
        Logger.log("Sending payment: ", this.getId(), this.accessId,
            this.asset.publisher.getId(), this.asset.price, this.timeout)
        return market.payOrder(this, account.getId())
    }
}
