import {Receipt} from "web3-utils"
import Asset from "../models/Asset"
import Config from "../models/Config"
import ContractBaseWrapper from "./ContractWrapperBase"
import Web3Helper from "./Web3Helper"

export default class OceanAuth extends ContractBaseWrapper {

    public static async getInstance(config: Config, web3Helper: Web3Helper): Promise<OceanAuth> {
        const auth: OceanAuth = new OceanAuth(config, "OceanAuth", web3Helper)
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

        const args = [asset.assetId, asset.publisherId, publicKey, timeout]
        const tx = this.contract.methods.initiateAccessRequest(...args)
        const gas = await tx.estimateGas(args, {
            from: buyerAddress,
        })
        return tx.send({
            from: buyerAddress,
            gas,
        })
    }
}
