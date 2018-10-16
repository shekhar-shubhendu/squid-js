import {Receipt} from "web3-utils"
import Asset from "../ocean/Asset"
import ContractBaseWrapper from "./ContractWrapperBase"

export default class OceanAuth extends ContractBaseWrapper {

    public static async getInstance(): Promise<OceanAuth> {
        const auth: OceanAuth = new OceanAuth("OceanAuth")
        await auth.init()
        return auth
    }

    public async getOrderStatus(orderId: string): Promise<number> {
        return this.contract.methods.statusOfAccessRequest(orderId)
            .call()
            .then((status: string) => parseInt(status, 10))
    }

    public async cancelAccessRequest(orderId: string, senderAddress: string): Promise<Receipt> {
        return this.contract.methods.cancelAccessRequest(orderId)
            .send({
                from: senderAddress,
            })
    }

    public async getEncryptedAccessToken(orderId: string, senderAddress: string): Promise<Receipt> {
        return this.contract.methods.getEncryptedAccessToken(orderId)
            .send({
                from: senderAddress,
            })
    }

    public async initiateAccessRequest(asset: Asset, publicKey: string,
                                       timeout: number, buyerAddress: string): Promise<Receipt> {

        const args = [asset.getId(), asset.publisher.getId(), publicKey, timeout]
        return this.sendTransaction("initiateAccessRequest", buyerAddress, args)
    }

    public async commitAccessRequest() {
        // todo
    }
}
