import TruffleContract from 'truffle-contract'

const contracts = []

export default class ContractLoader {
    static async _doLoad(what, where, provider) {
        // console.log("Loading", what, "from", where)
        /* eslint-disable-next-line */
        const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${what}.${where}`)
        const contract = TruffleContract(artifact)
        contract.setProvider(provider)
        contracts[what] = await contract.at(artifact.address)
        return contracts[what]
    }

    static load(what, where, provider) {
        return contracts[what] || ContractLoader._doLoad(what, where, provider)
    }
}
