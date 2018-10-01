import KeeperBase from './keeper/keeper-base'

export default class Account extends KeeperBase {
    constructor(web3Helper, token) {
        super(web3Helper)
        this.token = token
        return (async () => {
            return this
        })()
    }

    async list() {
        return Promise.all((await this.helper.getAccounts()).map(async (account) => {
            // await ocean.market.requestTokens(account, 1000)

            return {
                name: account,
                balance: {
                    ocn: await this.token.getTokenBalance(account),
                    eth: await this.token.getEthBalance(account)
                }
            }
        }))
    }

    currentAccount() {
        return this.helper.getCurrentAccount()
    }

    tokenBalance() {
        return this.token.getTokenBalance()
    }

    ethBalance() {
        return this.token.getEthBalance()
    }
}
