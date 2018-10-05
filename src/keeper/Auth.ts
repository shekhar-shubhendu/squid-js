import BigNumber from "bignumber.js"
import {Receipt} from "web3-utils"
import Asset from "../models/Asset"
import Config from "../models/Config"
import ContractBaseWrapper from "./ContractWrapperBase"
import Web3Helper from "./Web3Helper"

export default class OceanAuth extends ContractBaseWrapper {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {
        const auth = new OceanAuth(config, "OceanAuth", web3Helper)
        await auth.init()
        return auth
    }

    public async getOrderStatus(orderId: string): Promise<number> {
        return this.contract.statusOfAccessRequest(orderId)
            .call()
            .then((status: BigNumber) => status.toNumber())
    }

    public async cancelAccessRequest(orderId: string, senderAddress: string): Promise<Receipt> {
        return this.contract.cancelAccessRequest(orderId)
            .send({
                from: senderAddress,
            })
    }

    public async getEncryptedAccessToken(orderId: string, senderAddress: string): Promise<Receipt> {
        return this.contract.getEncryptedAccessToken(orderId)
            .send({
                from: senderAddress,
            })
    }

    public async initiateAccessRequest(asset: Asset, publicKey: string,
                                       timeout, buyerAddress: string): Promise<Receipt> {
        return this.contract.initiateAccessRequest(asset.assetId, asset.publisherId, publicKey, timeout)
            .send({
                from: buyerAddress,
                gas: this.config.defaultGas,
            })
    }
}
