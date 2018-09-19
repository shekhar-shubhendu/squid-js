import Logger from './logger'

export default class Web3Helper {
    constructor(web3) {
        this._web3 = web3
    }

    getAccounts() {
        Logger.log(this._web3)
        return this._web3.eth.accounts
    }

    // web3 wrappers
    sign(accountAddress, message) {
        return this._web3.eth.sign(accountAddress, message)
    }
}
