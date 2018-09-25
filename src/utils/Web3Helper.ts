import Web3 = require("web3");

export default class Web3Helper {
    public web3: Web3;

    constructor(config: any) {
        const web3Provider = config.web3Provider || new Web3.providers.HttpProvider(config.nodeUri)
        this.web3 = new Web3(web3Provider)
    }

    async getAccounts(): Promise<any[]> {
        return new Promise<any[]>((resolve: Function, reject: Function) => {
            this.web3.eth.getAccounts((err: any, accounts: string[]) => {
                if (err) {
                    throw err
                }
                resolve(accounts)
            })
        })
    }

    async getNetworkName(): Promise<string> {
        return new Promise<string>((resolve: Function, reject: Function) => {
            let network: string = 'unknown'
            // @ts-ignore old version of web3, lets get to 1.0
            this.web3.version.getNetwork((err, networkId) => {
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
    sign(accountAddress: string, message: string) {
        return this.web3.eth.sign(accountAddress, message)
    }
}
