import Config from "../models/config";
import Logger from "../utils/Logger";
import ContractBaseWrapper from "./ContractWrapperBase";
import Web3Helper from "./Web3Helper";

export default class OceanToken extends ContractBaseWrapper {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {
        const token = new OceanToken(config, "OceanToken", web3Helper);
        await token.init();
        return token;
    }

    public async getTokenBalance(accountAddress: string) {
        return this.contract.methods.balanceOf(accountAddress).call();
    }

    public async getEthBalance(account: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            // Logger.log("getting balance for", account);
            this.web3Helper.getWeb3().eth.getBalance(account, "latest", (err: any, balance: number) => {
                if (err) {
                    return reject(err);
                }
                // Logger.log("balance", balance);
                resolve(balance);
            });
        });
    }

    public async approve(marketAddress: string, price: number, buyerAddress: string) {
        return this.contract.methods.approve(marketAddress, price).send({
            from: buyerAddress,
            gas: this.config.defaultGas,
        });
    }
}
