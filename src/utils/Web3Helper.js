export default class Web3Helper {
    constructor(web3) {
        this.web3 = web3
    }

    getAccounts() {
        return this.web3.eth.accounts
    }

    getNetworkName() {
        let network = 'unknown'
        switch (this.web3.version.network) {
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
        return network
    }

    // web3 wrappers
    sign(accountAddress, message) {
        return this.web3.eth.sign(accountAddress, message)
    }
}
