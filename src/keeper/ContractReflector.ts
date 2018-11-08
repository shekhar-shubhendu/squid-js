import MethodReflection from "../models/MethodReflection"
import GenericContract from "./contracts/GenericContract"

export default class ContractReflector {

    public static async reflectContractMethod(pathToMethod: string): Promise<MethodReflection> {
        const parts: string[] = pathToMethod.split(".")

        const contract = await GenericContract.getInstance(parts[0])
        return {
            contractName: parts[0],
            methodName: parts[1],
            address: contract.getAddress(),
            signature: contract.getSignatureOfMethod(parts[1]),
            inputs: contract.getInputsOfMethod(parts[1]),
        } as MethodReflection
    }
}
