import ContractReflector from "../../keeper/ContractReflector"
import Keeper from "../../keeper/Keeper"
import Web3Provider from "../../keeper/Web3Provider"
import MethodReflection from "../../models/MethodReflection"
import ValuePair from "../../models/ValuePair"
import Logger from "../../utils/Logger"
import Account from "../Account"
import OceanBase from "../OceanBase"
import Condition from "./Condition"
import Method from "./Method"
import TemplateBase from "./Templates/TemplateBase"

export default class ServiceAgreementTemplate extends OceanBase {

    public async register(templateOwnerAddress: string)
        : Promise<boolean> {

        const dependencyMatrix: number[] =
            await Promise.all(this.template.Methods.map(async (method: Method) => {
                // tslint:disable
                return method.dependency | method.timeout
            }))

        const {serviceAgreement} = await Keeper.getInstance()

        const methodReflections = await this.getMethodReflections()

        const owner = await this.getOwner()

        if (!owner.getId().startsWith("0x0")) {
            Logger.error(`Template with id "${this.template.id}" already registered.`)
            return false
        }

        const receipt = await serviceAgreement.setupAgreementTemplate(
            this.template.id, methodReflections, dependencyMatrix,
            Web3Provider.getWeb3().utils.fromAscii(this.template.templateName),
            templateOwnerAddress)

        const templateId = receipt.events.SetupAgreementTemplate.returnValues.serviceTemplateId

        if (templateId !== this.template.id) {
            throw new Error(`TemplateId missmatch on ${this.template.templateName}! Should be "${this.template.id}" but is ${templateId}`)
        }

        if (receipt.status) {
            Logger.error("Registering template failed")
        }

        return receipt.status
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

    public constructor(private template: TemplateBase) {
        super(template.id)
    }

    /**
     * gets the status of a service agreement template
     */
    public async getStatus(): Promise<boolean> {
        const {serviceAgreement} = await Keeper.getInstance()
        return serviceAgreement.getTemplateStatus(this.getId())
    }

    public async getOwner(): Promise<Account> {
        const {serviceAgreement} = await Keeper.getInstance()

        return new Account(await serviceAgreement.getTemplateOwner(this.id))
    }

    private async getMethodReflections(): Promise<MethodReflection[]> {
        const methodReflections: MethodReflection[] =
            await Promise.all(this.template.Methods.map(async (method: Method) => {
                const methodReflection = await
                    ContractReflector.reflectContractMethod(method.path)
                return methodReflection
            }))
        return methodReflections
    }

    public async getConditions(): Promise<Condition[]> {
        const methodReflections = await this.getMethodReflections()

        const conditions: Condition[] = methodReflections.map((methodReflection, i) => {
            return {
                methodReflection,
                timeout: this.template.Methods[i].timeout,
                condtionKey: ServiceAgreementTemplate.generateConditionsKey(this.getId(),
                    methodReflection),
            } as Condition
        })

        return conditions
    }
}
