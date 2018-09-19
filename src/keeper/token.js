import ContractLoader from './contractLoader'
import KeeperBase from './keeper-base'
import { Logger } from '../utils/logger'

export default class OceanToken extends KeeperBase {
    constructor(web3, network) {
        super(web3, network)

        const instance = this

        return {
            async getInstance() {
                instance.contract = ContractLoader.load('OceanToken', instance._network, instance._web3)

                return instance
            }
        }
    }

    getTokenBalance(accountAddress) {
        return this.contract.balanceOf.call(accountAddress)
    }

    getEthBalance(account) {
        return new Promise((resolve, reject) => {
            Logger.log('getting balance for', account)
            super._web3.eth.getBalance(account, 'latest', (err, balance) => {
                if (err) return reject(err)
                Logger.log('balance', balance)
                resolve(balance)
            })
        })
    }
}
