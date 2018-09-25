import BigNumber from "bignumber.js";
import Config from "../utils/config";
import Logger from "../utils/logger";
import Web3Helper from "../utils/Web3Helper";
import ContractLoader from "./contractLoader";
import KeeperBase from "./keeper-base";

export default class OceanMarket extends KeeperBase {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {

        const market = new OceanMarket(config, web3Helper);
        market.contract = await ContractLoader.load("OceanMarket", market.web3Helper);
        return market;
    }

    private constructor(config: Config, web3Helper: Web3Helper) {
        super(config, web3Helper);
    }

    // call functions (costs no gas)
    public checkAsset(assetId: string) {
        return this.contract.checkAsset(assetId);
    }

    public verifyOrderPayment(orderId: string): boolean {
        return this.contract.verifyPaymentReceived(orderId);
    }

    public getAssetPrice(assetId: string) {
        return this.contract.getAssetPrice(assetId)
            .then((price: BigNumber) => price.toNumber());
    }

    // Transactions with gas cost
    public requestTokens(amount: number, address: string) {
        return this.contract.requestTokens(amount, {from: address});
    }

    public async registerAsset(name: string, description: string, price: number, publisherAddress: string) {
        const assetId = await this.contract.generateId(name + description);
        const result = await this.contract.register(
            assetId,
            price, {
                from: publisherAddress,
                gas: this.config.defaultGas,
            },
        );
        Logger.log("registered: ", result);
        return assetId;
    }

    public async payAsset(assetId: string, order: any, publisherAddress: string, senderAddress: string) {
        const assetPrice = await this.contract.getAssetPrice(assetId)
            .then((price: BigNumber) => price.toNumber());
        this.contract.sendPayment(order.id, publisherAddress, assetPrice, order.timeout, {
            from: senderAddress,
            gas: 2000000,
        });
    }
}
