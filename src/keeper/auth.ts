import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'
import Web3Helper from "../utils/Web3Helper";
import Config from "../utils/config";

export default class OceanAuth extends KeeperBase {

    private constructor(config: Config, web3Helper: Web3Helper) {
        super(config, web3Helper)
    }

    public static async getInstance(config: Config, web3Helper) {
        const auth = new OceanAuth(config, web3Helper);

        auth.contract = await ContractLoader.load('OceanAuth', auth._web3Helper)
        return auth;
    }

    cancelAccessRequest(orderId: string, senderAddress: string) {
        return this.contract.cancelAccessRequest(orderId, {from: senderAddress})
    }

    getOrderStatus(orderId: string) {
        return this.contract.statusOfAccessRequest(orderId)
    }

    getEncryptedAccessToken(orderId: string, senderAddress: string) {
        return this.contract.getEncryptedAccessToken(orderId, {from: senderAddress})
    }
}
