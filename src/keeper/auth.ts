import Config from "../utils/config";
import Web3Helper from "../utils/Web3Helper";
import ContractLoader from "./contractLoader";
import KeeperBase from "./keeper-base";

export default class OceanAuth extends KeeperBase {

    public static async getInstance(config: Config, web3Helper) {
        const auth = new OceanAuth(config, web3Helper);

        auth.contract = await ContractLoader.load("OceanAuth", auth.web3Helper);
        return auth;
    }

    private constructor(config: Config, web3Helper: Web3Helper) {
        super(config, web3Helper);
    }

    public cancelAccessRequest(orderId: string, senderAddress: string) {
        return this.contract.cancelAccessRequest(orderId, {from: senderAddress});
    }

    public getOrderStatus(orderId: string) {
        return this.contract.statusOfAccessRequest(orderId);
    }

    public getEncryptedAccessToken(orderId: string, senderAddress: string) {
        return this.contract.getEncryptedAccessToken(orderId, {from: senderAddress});
    }
}
