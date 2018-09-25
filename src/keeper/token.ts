import Config from "../utils/config";
import Logger from "../utils/logger";
import Web3Helper from "../utils/Web3Helper";
import ContractLoader from "./contractLoader";
import KeeperBase from "./keeper-base";

export default class OceanToken extends KeeperBase {

    public static async getInstance(config: Config, web3Helper: Web3Helper) {
        const token = new OceanToken(config, web3Helper);
        token.contract = await ContractLoader.load("OceanToken", token.web3Helper);

        return token;
    }

    private constructor(config: Config, web3Helper: Web3Helper) {
        super(config, web3Helper);
    }

    public getTokenBalance(accountAddress: string) {
        return this.contract.balanceOf.call(accountAddress);
    }

    public async getEthBalance(account: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            Logger.log("getting balance for", account);
            this.web3Helper.web3.eth.getBalance(account, "latest", (err: any, balance: number) => {
                if (err) {
                    return reject(err);
                }
                Logger.log("balance", balance);
                resolve(balance);
            });
        });
    }
}
