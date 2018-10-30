import AccessConditions from "../keeper/contracts/conditions/AccessConditions"
import PaymentConditions from "../keeper/contracts/conditions/PaymentConditions"
import ServiceAgreement from "../keeper/contracts/ServiceAgreement"
import Web3Provider from "../keeper/Web3Provider"
import Account from "./Account"
import OceanBase from "./OceanBase"

export default class ServiceAgreementTemplate extends OceanBase {

    public static async registerServiceAgreementsTemplate(resourceName: string, publisher: Account):
        Promise<ServiceAgreementTemplate> {

        const paymentConditions: PaymentConditions = await PaymentConditions.getInstance()
        const accessConditions: AccessConditions = await AccessConditions.getInstance()

        const contractAddresses = [
            await paymentConditions.getAddress(),
            await accessConditions.getAddress(),
            await paymentConditions.getAddress(),
            await paymentConditions.getAddress(),
        ]
        const functionSignatures = [
            await paymentConditions.getSignatureOfMethod("lockPayment"),
            await accessConditions.getSignatureOfMethod("grantAccess"),
            await paymentConditions.getSignatureOfMethod("releasePayment"),
            await paymentConditions.getSignatureOfMethod("refundPayment"),
        ]

        // tslint:disable
        const dependencies = [0, 1, 4, 1 | 2 ** 4 | 2 ** 5] // dependency bit | timeout bit

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.getInstance()

        const receipt = await serviceAgreement.setupAgreementTemplate(
            contractAddresses, functionSignatures, dependencies,
            Web3Provider.getWeb3().utils.fromAscii(resourceName), publisher.getId())

        const id = receipt.events.SetupAgreementTemplate.returnValues.serviceTemplateId

        return new ServiceAgreementTemplate(
            id,
            ServiceAgreementTemplate.generateConditionsKeys(id, contractAddresses, functionSignatures),
            publisher)
    }

    private static generateConditionsKeys(serviceAgreementTemplateId: string, contractAddresses: string[],
                                          functionSignatures: string[]): string[] {
        const conditions = []
        for (let i = 0; i < contractAddresses.length; i++) {
            const types = ["bytes32", "address", "bytes4"]
            const values = [serviceAgreementTemplateId, contractAddresses[i], functionSignatures[i]]
            conditions.push(Web3Provider.getWeb3().utils.soliditySha3(...types, ...values).toString("hex"))
        }
        return conditions
    }

    private constructor(id, private conditionKeys: string[], private publisher: Account) {
        super(id)
    }

    public getPublisher(): Account {
        return this.publisher
    }

    public getConditionKeys(): string[] {
        return this.conditionKeys
    }
}
