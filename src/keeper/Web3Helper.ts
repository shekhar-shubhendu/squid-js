import Web3 = require("web3")
import Config from "../models/Config"

export default class Web3Helper {

    private web3: Web3

    public constructor(config: Config) {
        const web3Provider = config.web3Provider || new Web3.providers.HttpProvider(config.nodeUri)
        this.web3 = new Web3(web3Provider)
    }

    public getWeb3() {
        return this.web3
    }

    public getCurrentProvider() {
        return this.web3.currentProvider
    }

    public async getAccounts(): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            this.web3.eth.getAccounts((err: any, accounts: string[]) => {
                if (err) {
                    reject(err)
                    throw err
                }
                resolve(accounts)
            })
        })
    }

    public async getNetworkName(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let network: string = "unknown"

            this.web3.eth.net.getId((err, networkId) => {
                if (err) {
                    reject(err)
                    throw err
                }
                switch (networkId) {
                    case 1:
                        network = "Main"
                        break
                    case 2:
                        network = "Morden"
                        break
                    case 3:
                        network = "Ropsten"
                        break
                    case 4:
                        network = "Rinkeby"
                        break
                    case 42:
                        network = "Kovan"
                        break
                    default:
                        network = "development"
                }
                resolve(network)
            })
        })
    }

    // web3 wrappers
    public sign(accountAddress: string, message: string) {
        return this.web3.eth.sign(accountAddress, message)
    }

}
