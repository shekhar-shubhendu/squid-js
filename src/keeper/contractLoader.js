import TruffleContract from 'truffle-contract'
import Logger from '../utils/logger'

const contracts = []

export default class ContractLoader {
    static async _doLoad(what, web3Helper) {
        const where = (await web3Helper.getNetworkName()).toLowerCase()
        Logger.log('Loading', what, 'from', where)
        try {
            /* eslint-disable-next-line security/detect-non-literal-require */
            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${what}.${where}`)
            // Logger.log('Loaded artifact', artifact)

            const contract = TruffleContract(artifact)
            Logger.log('Getting instance of', what, 'from', where, 'at', artifact.address)
            contract.setProvider(web3Helper.web3.currentProvider)
            contracts[what] = await contract.at(artifact.address)
            return contracts[what]
        } catch (err) {
            Logger.error('Failed to load', what, 'from', where)
        }
    }

    static async load(what, where, provider) {
        return contracts[what] || ContractLoader._doLoad(what, where, provider)
    }
}
