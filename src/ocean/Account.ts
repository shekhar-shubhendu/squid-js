import BigNumber from "bignumber.js"
import Keeper from "../keeper/Keeper"
import Web3Provider from "../keeper/Web3Provider"
import Balance from "../models/Balance"
import OceanBase from "./OceanBase"

export default class Account extends OceanBase {
    private balance: Balance

    public async getOceanBalance(): Promise<number> {
        return (await Keeper.getInstance()).token.balanceOf(this.id)
    }

    public async getEthBalance(): Promise<number> {
        // Logger.log("getting balance for", account);
        return Web3Provider.getWeb3().eth
            .getBalance(this.id, "latest")
            .then((balance: string): number => {
                // Logger.log("balance", balance);
                return new BigNumber(balance).toNumber()
            })
    }

    public async getBalance(): Promise<Balance> {

        if (!this.balance) {
            this.balance = {
                eth: await this.getEthBalance(),
                ocn: await this.getOceanBalance(),
            } as Balance
        }

        return this.balance
    }

    // Transactions with gas cost
    public async requestTokens(amount: number): Promise<boolean> {
        return (await Keeper.getInstance()).market.requestTokens(amount, this.id)
    }
}
