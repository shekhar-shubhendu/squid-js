import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'
import Logger from '../utils/logger'

export default class OceanToken extends KeeperBase {
    constructor(web3Helper) {
        super(web3Helper)

        return (async () => {
            this.contract = await ContractLoader.load('OceanToken', this._web3Helper)

            return this
        })()
    }

    getTokenBalance(accountAddress) {
        return this.contract.balanceOf.call(accountAddress)
    }

    async getEthBalance(account) {
        return new Promise((resolve, reject) => {
            Logger.log('getting balance for', account)
            this._web3Helper.web3.eth.getBalance(account, 'latest', (err, balance) => {
                if (err) return reject(err)
                Logger.log('balance', balance)
                resolve(balance)
            })
        })
    }
}
