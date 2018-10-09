import Contract from "web3-eth-contract"
import Logger from "../utils/Logger"
import Web3Helper from "./Web3Helper"

const contracts: Map<string, Contract> = new Map<string, Contract>()

export default class ContractHandler {

    public static async get(what: string, web3Helper: Web3Helper): Contract {
        return contracts.get(what) || await ContractHandler.load(what, web3Helper)
    }

    public static async deployContracts(web3Helper: Web3Helper) {
        Logger.log("Deploying contracts")

        const web3 = web3Helper.getWeb3()

        const deployerAddress = (await web3.eth.getAccounts())[0]

        // deploy libs
        const dll = await ContractHandler.deployContract(web3, "DLL", deployerAddress)
        const attributeStore = await ContractHandler.deployContract(web3, "AttributeStore", deployerAddress)

        // deploy contracts
        const token = await ContractHandler.deployContract(web3, "OceanToken", deployerAddress)
        const plcrVoting = await ContractHandler.deployContract(web3, "PLCRVoting", deployerAddress, {
            args: [token.options.address],
            tokens: [
                {
                    name: "DLL", address: dll.options.address,
                }, {
                    name: "AttributeStore", address: attributeStore.options.address,
                },
            ],
        })
        const registry = await ContractHandler.deployContract(web3, "OceanRegistry", deployerAddress, {
            args: [token.options.address, plcrVoting.options.address],
        })
        const market = await ContractHandler.deployContract(web3, "OceanMarket", deployerAddress, {
            args: [token.options.address, registry.options.address],
        })
        const dispute = await ContractHandler.deployContract(web3, "OceanDispute", deployerAddress, {
            args: [market.options.address, registry.options.address, plcrVoting.options.address],
        })
        await ContractHandler.deployContract(web3, "OceanAuth", deployerAddress, {
            args: [market.options.address, dispute.options.address],
        })
    }

    private static async load(what: string, web3Helper: Web3Helper): Promise<Contract> {
        const where = (await web3Helper.getNetworkName()).toLowerCase()
        Logger.log("Loading", what, "from", where)
        try {
            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${what}.${where}`)
            // Logger.log('Loaded artifact', artifact)
            // Logger.log("Getting instance of", what, "from", where, "at", artifact.address)
            const web3 = web3Helper.getWeb3()
            const contract = new web3.eth.Contract(artifact.abi, artifact.address)
            Logger.log("Loaded", what, "from", where)
            contracts.set(what, contract)
            return contracts.get(what)
        } catch (err) {
            Logger.error("Failed to load", what, "from", where, err)
        }
    }

    private static replaceTokens(bytecode: string, tokens: any[]) {

        for (const token of tokens) {

            bytecode = bytecode.replace(
                new RegExp(`_+${token.name}_+`, "g"),
                token.address.replace("0x", ""))
        }
        // Logger.log(bytecode);

        return bytecode.toString()
    }

    private static async deployContract(web3, name, from, params?): Promise<Contract> {

        // dont redeploy if there is already something loaded
        if (contracts.has(name)) {
            return contracts.get(name)
        }

        let contractInstance: Contract
        try {
            Logger.log("Deploying", name)

            const artifact = require(`@oceanprotocol/keeper-contracts/artifacts/${name}.development.json`)
            const tempContract = new web3.eth.Contract(artifact.abi, artifact.address)
            contractInstance = await tempContract.deploy({
                data: params && params.tokens ?
                    ContractHandler.replaceTokens(artifact.bytecode.toString(), params.tokens) :
                    artifact.bytecode,
                arguments: params && params.args ? params.args : null,
            }).send({
                from,
                gas: 3000000,
                gasPrice: 10000000000,
            })
            contracts.set(name, contractInstance)
            // Logger.log("Deployed", name, "at", contractInstance.options.address);
        } catch (err) {
            Logger.error("Deployment failed for", name, "with params", JSON.stringify(params, null, 2), err.message)
            throw err
        }

        return contractInstance
    }
}
