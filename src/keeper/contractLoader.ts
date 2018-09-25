import * as TruffleContract from 'truffle-contract'
import Logger from '../utils/logger'
import Web3Helper from '../utils/Web3Helper'

const contracts: Map<string, object> = new Map<string, object>()

export default class ContractLoader {
    static async _doLoad(what: string, web3Helper: Web3Helper): Promise<object> {
        const where = (await web3Helper.getNetworkName()).toLowerCase()
        Logger.log('Loading', what, 'from', where)
        try {
            /* eslint-disable-next-line security/detect-non-literal-require */
            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${what}.${where}`)
            // Logger.log('Loaded artifact', artifact)

            const contract = TruffleContract(artifact)
            Logger.log('Getting instance of', what, 'from', where, 'at', artifact.address)
            contract.setProvider(web3Helper.web3.currentProvider)
            contracts.set(what, await contract.at(artifact.address))
            return contracts.get(what)
        } catch (err) {
            Logger.error('Failed to load', what, 'from', where)
        }
    }

    static async load(what: string, web3Helper: Web3Helper) {
        return contracts.get(what) || await ContractLoader._doLoad(what, web3Helper)
    }
}
