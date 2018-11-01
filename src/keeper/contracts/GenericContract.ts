import ContractBase from "./ContractBase"

export default class GenericContract extends ContractBase {

    public static async getInstance(contractName: string) {
        const contract: GenericContract = new GenericContract(contractName)
        await contract.init()
        return contract
    }

    private constructor(contractName: string) {
        super(contractName)
    }
}
