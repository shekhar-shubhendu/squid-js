import ContractReflector from "../keeper/ContractReflector"
import ServiceAgreement from "../keeper/contracts/ServiceAgreement"
import Web3Provider from "../keeper/Web3Provider"
import MethodReflection from "../models/MethodReflection"
import Account from "./Account"
import OceanBase from "./OceanBase"

export default class ServiceAgreementTemplate extends OceanBase {

    public static async registerServiceAgreementsTemplate(serviceName: string, templateOwner: Account):
        Promise<ServiceAgreementTemplate> {

        const methodReflections: MethodReflection[] = [
            await ContractReflector.reflectContractMethod("PaymentConditions.lockPayment"),
            await ContractReflector.reflectContractMethod("AccessConditions.grantAccess"),
            await ContractReflector.reflectContractMethod("PaymentConditions.releasePayment"),
            await ContractReflector.reflectContractMethod("PaymentConditions.refundPayment"),
        ]

        // tslint:disable
        const dependencyMatrix = [0, 1, 4, 1 | 2 ** 4 | 2 ** 5] // dependency bit | timeout bit

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.getInstance()

        const receipt = await serviceAgreement.setupAgreementTemplate(
            methodReflections, dependencyMatrix,
            Web3Provider.getWeb3().utils.fromAscii(serviceName),
            templateOwner.getId())

        const id = receipt.events.SetupAgreementTemplate.returnValues.serviceTemplateId

        return new ServiceAgreementTemplate(
            id,
            ServiceAgreementTemplate.generateConditionsKeys(id, methodReflections),
            templateOwner)
    }

    /**
     * gets the status of a service agreement template
     */
    public async getStatus(): Promise<boolean> {

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.getInstance()

        return serviceAgreement.getTemplateStatus(this.getId())
    }

    private static generateConditionsKeys(serviceAgreementTemplateId: string, methodReflections: MethodReflection[]):
        string[] {
        const conditions = []
        for (let i = 0; i < methodReflections.length; i++) {
            const values = [
                {type: "bytes32", value: serviceAgreementTemplateId},
                {type: "address", value: methodReflections[i].address},
                {type: "bytes4", value: methodReflections[i].signature},
            ]
            conditions.push(Web3Provider.getWeb3().utils.soliditySha3(...values).toString("hex"))
        }
        return conditions
    }

    private constructor(id, private conditionKeys: string[], private owner: Account) {
        super(id)
    }

    public getOwner(): Account {
        return this.owner
    }

    public getConditionKeys(): string[] {
        return this.conditionKeys
    }
}
