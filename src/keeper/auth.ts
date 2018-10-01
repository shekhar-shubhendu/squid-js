import BigNumber from "bignumber.js";
import Asset from "../models/Asset";
import Config from "../models/Config";
import ContractBaseWrapper from "./ContractWrapperBase";
import Web3Helper from "./Web3Helper";

export default class OceanAuth extends ContractBaseWrapper {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {
        const auth = new OceanAuth(config, "OceanAuth", web3Helper);
        await auth.init();
        return auth;
    }

    public async getOrderStatus(orderId: string): Promise<number> {
        return this.contract.statusOfAccessRequest.call(orderId)
            .then((status: BigNumber) => status.toNumber());
    }

    public async cancelAccessRequest(orderId: string, senderAddress: string) {
        return this.contract.cancelAccessRequest.send(orderId, {
            from: senderAddress,
        });
    }

    public async getEncryptedAccessToken(orderId: string, senderAddress: string) {
        return this.contract.getEncryptedAccessToken.send(orderId, {
            from: senderAddress,
        });
    }

    public async initiateAccessRequest(asset: Asset, publicKey: string, timeout, buyerAddress: string) {
        return this.contract.initiateAccessRequest.send(
            asset.assetId, asset.publisherId, publicKey, timeout, {
                from: buyerAddress, gas: this.config.defaultGas,
            });
    }
}
