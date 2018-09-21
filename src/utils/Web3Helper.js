import Logger from './logger'

export default class Web3Helper {
    constructor(web3) {
        this.web3 = web3
    }

    async getAccounts() {
        return new Promise((resolve, reject) => {
            this.web3.eth.getAccounts((err, accounts) => {
                if (err) {
                    throw err
                }
                resolve(accounts)
            })
        })
    }

    async getNetworkName() {
        return new Promise((resolve, reject) => {
            let network = 'unknown'
            this.web3.version.getNetwork((err, networkId) => {
                Logger.log('networkId', networkId)
                if (err) {
                    throw err
                }
                switch (networkId) {
                    case '1':
                        network = 'Main'
                        break
                    case '2':
                        network = 'Morden'
                        break
                    case '3':
                        network = 'Ropsten'
                        break
                    case '4':
                        network = 'Rinkeby'
                        break
                    case '42':
                        network = 'Kovan'
                        break
                    default:
                        network = 'development'
                }
                resolve(network)
            })
        })
    }

    // web3 wrappers
    sign(accountAddress, message) {
        return this.web3.eth.sign(accountAddress, message)
    }
}
