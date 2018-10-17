import {Receipt} from "web3-utils"
import AccessStatus from "../models/AccessStatus"
import Asset from "../ocean/Asset"
import Order from "../ocean/Order"
import ContractBaseWrapper from "./ContractWrapperBase"

export default class OceanAuth extends ContractBaseWrapper {

    public static async getInstance(): Promise<OceanAuth> {
        const auth: OceanAuth = new OceanAuth("OceanAuth")
        await auth.init()
        return auth
    }

    public async getOrderStatus(orderId: string): Promise<AccessStatus> {
        return this.call("statusOfAccessRequest", [orderId])
            .then((status: string) => {
                const statusInt = parseInt(status, 10)
                const statusString = AccessStatus[statusInt]
                return AccessStatus[statusString]
            })
    }

    public async getEncryptedAccessToken(orderId: string, consumerAddress: string): Promise<Receipt> {
        return this.call("getEncryptedAccessToken", [orderId], consumerAddress)
    }

    public async initiateAccessRequest(asset: Asset, publicKey: string,
                                       timeout: number, buyerAddress: string): Promise<Receipt> {
        const args = [asset.getId(), asset.publisher.getId(), publicKey, timeout]
        return this.sendTransaction("initiateAccessRequest", buyerAddress, args)
    }

    public async commitAccessRequest(order: Order, publisherAddress: string) {
        const args = [order.getId(), true, 9999999999, "discovery", "read", "slaLink", "slaType"]
        return this.sendTransaction("commitAccessRequest", publisherAddress, args)
    }

    public async getTempPubKey(orderId: string) {
        return this.call("getTempPubKey", [orderId])
    }

    public async deliverAccessToken(orderId: string, accessToken: string, publisherAddress: string) {
        return this.sendTransaction("deliverAccessToken", publisherAddress, [orderId, accessToken])
    }

}
