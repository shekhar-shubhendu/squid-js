import ContractReflector from "../../keeper/ContractReflector"
import ServiceAgreement from "../../keeper/contracts/ServiceAgreement"
import Web3Provider from "../../keeper/Web3Provider"
import MethodReflection from "../../models/MethodReflection"
import ValuePair from "../../models/ValuePair"
import Account from "../Account"
import OceanBase from "../OceanBase"
import Condition from "./Condition"
import Method from "./Method"

export default class ServiceAgreementTemplate extends OceanBase {

    public static async registerServiceAgreementsTemplate(serviceName: string, methods: Method[],
                                                          templateOwner: Account)
        : Promise<ServiceAgreementTemplate> {

        const methodReflections: MethodReflection[] =
            await Promise.all(methods.map(async (method: Method) => {
                const methodReflection = await
                    ContractReflector.reflectContractMethod(method.path)
                return methodReflection
            }))

        const dependencyMatrix: number[] =
            await Promise.all(methods.map(async (method: Method) => {
                // tslint:disable
                return method.dependency | method.timeout
            }))

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.getInstance()

        const receipt = await serviceAgreement.setupAgreementTemplate(
            methodReflections, dependencyMatrix,
            Web3Provider.getWeb3().utils.fromAscii(serviceName),
            templateOwner.getId())

        const serviceAgreementTemplateId =
            receipt.events.SetupAgreementTemplate.returnValues.serviceTemplateId

        const conditions: Condition[] = methodReflections.map((methodReflection, i) => {
            return {
                methodReflection,
                timeout: methods[i].timeout,
                condtionKey: ServiceAgreementTemplate.generateConditionsKey(serviceAgreementTemplateId,
                    methodReflection),
            } as Condition
        })

        return new ServiceAgreementTemplate(
            serviceAgreementTemplateId,
            conditions,
            templateOwner)
    }

    private static generateConditionsKey(serviceAgreementTemplateId: string, methodReflection: MethodReflection)
        : string {
        const values = [
            {type: "bytes32", value: serviceAgreementTemplateId} as ValuePair,
            {type: "address", value: methodReflection.address} as ValuePair,
            {type: "bytes4", value: methodReflection.signature} as ValuePair,
        ]
        return Web3Provider.getWeb3().utils.soliditySha3(...values).toString("hex")
    }

    private constructor(serviceAgreementTemplateId, private conditions: Condition[],
                        private owner: Account) {
        super(serviceAgreementTemplateId)
    }

    /**
     * gets the status of a service agreement template
     */
    public async getStatus(): Promise<boolean> {
        const serviceAgreement: ServiceAgreement = await ServiceAgreement.getInstance()
        return serviceAgreement.getTemplateStatus(this.getId())
    }

    public getOwner(): Account {
        return this.owner
    }

    public getConditions(): Condition[] {
        return this.conditions
    }
}
