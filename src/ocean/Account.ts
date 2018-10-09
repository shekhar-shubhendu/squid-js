import BigNumber from "bignumber.js"
import AccountModel from "../models/Account"
import OceanBase from "./OceanBase"

export default class Account extends OceanBase {

    public async getTokenBalance(accountAddress: string): Promise<number> {
        return this.keeper.token.balanceOf(accountAddress)
    }

    public async getEthBalance(account: string): Promise<number> {
        const {web3Helper} = this.keeper
        // Logger.log("getting balance for", account);
        return web3Helper.getWeb3().eth.getBalance(account, "latest")
            .then((balance: string) => {
                // Logger.log("balance", balance);
                return new BigNumber(balance).toNumber()
            })
    }

    public async list() {
        const {web3Helper} = this.keeper

        const ethAccounts = await web3Helper.getAccounts()
        return Promise.all(ethAccounts
            .map(async (account: string) => {
                // await ocean.market.requestTokens(account, 1000)
                return {
                    name: account,
                    balance: {
                        eth: await this.getEthBalance(account),
                        ocn: await this.getTokenBalance(account),
                    },
                } as AccountModel
            }))
    }

    // Transactions with gas cost
    public async requestTokens(amount: number, receiver: string): Promise<boolean> {
        return this.keeper.market.requestTokens(amount, receiver)
    }
}
