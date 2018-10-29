import ContractBase from "../ContractBase"

export default class AccessConditions extends ContractBase {

    public static async getInstance(): Promise<AccessConditions> {
        const accessConditions: AccessConditions = new AccessConditions("AccessConditions")
        await accessConditions.init()
        return accessConditions
    }
}
