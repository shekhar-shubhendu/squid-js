import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'
import Logger from '../utils/logger'

export default class OceanToken extends KeeperBase {
    constructor(web3, network) {
        super(web3, network)

        return (async () => {
            this.contract = await ContractLoader.load('OceanToken', this._network, this._web3)

            return this
        })()
    }

    getTokenBalance(accountAddress) {
        return this.contract.balanceOf.call(accountAddress)
    }

    async getEthBalance(account) {
        return new Promise((resolve, reject) => {
            Logger.log('getting balance for', account)
            this._web3.eth.getBalance(account, 'latest', (err, balance) => {
                if (err) return reject(err)
                Logger.log('balance', balance)
                resolve(balance)
            })
        })
    }
}
