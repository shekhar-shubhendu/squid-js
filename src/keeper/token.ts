import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'
import Logger from '../utils/logger'
import Web3Helper from "../utils/Web3Helper"
import Config from "../utils/config";

export default class OceanToken extends KeeperBase {

    private constructor(config: Config, web3Helper: Web3Helper) {
        super(config, web3Helper)
    }

    public static async getInstance(config: Config, web3Helper: Web3Helper) {
        const token = new OceanToken(config, web3Helper)
        token.contract = await ContractLoader.load('OceanToken', token._web3Helper)

        return token;
    }

    getTokenBalance(accountAddress: string) {
        return this.contract.balanceOf.call(accountAddress)
    }

    async getEthBalance(account: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            Logger.log('getting balance for', account)
            this._web3Helper.web3.eth.getBalance(account, 'latest', (err: any, balance: number) => {
                if (err) return reject(err)
                Logger.log('balance', balance)
                resolve(balance)
            })
        })
    }
}
