import MethodReflection from "../models/MethodReflection"
import GenericContract from "./contracts/GenericContract"

export default class ContractReflector {

    public static async reflectContractMethod(contractName: string, methodName: string): Promise<MethodReflection> {
        const contract = await GenericContract.getInstance(contractName)
        return {
            contractName,
            methodName,
            address: contract.getAddress(),
            signature: contract.getSignatureOfMethod(methodName),
            inputs: contract.getInputsOfMethod(methodName),
        } as MethodReflection
    }
}
