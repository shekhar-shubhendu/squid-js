import AccessConditions from "../keeper/contracts/conditions/AccessConditions"
import ServiceAgreementContract from "../keeper/contracts/ServiceAgreement"
import Web3Provider from "../keeper/Web3Provider"
import Account from "./Account"
import IdGenerator from "./IdGenerator"
import OceanBase from "./OceanBase"
import ServiceAgreementTemplate from "./ServiceAgreementTemplate"

export default class ServiceAgreement extends OceanBase {

    public static async createServiceAgreement(serviceAgreementTemplate: ServiceAgreementTemplate, assetId: string,
                                               did: string, consumer: Account, publisher: Account) {

        // todo: this should come from ddo
        const serviceAgreementId = IdGenerator.generateId()
        const timeoutValues = [0, 0, 0, 500] // timeout 500 blocks @ condition 4
        const values = [
            {type: "bool", value: true},
            {type: "bool", value: false},
            {type: "uint", value: 120},
            {type: "string", value: assetId},
        ]

        const saHashSig = await ServiceAgreement.createSAHashSignature(serviceAgreementTemplate, serviceAgreementId,
            values, timeoutValues, consumer)

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.signServiceAgreement(serviceAgreementTemplate,
            serviceAgreementId, assetId, did, values, timeoutValues, saHashSig, consumer, publisher)

        return serviceAgreement
    }

    private static async signServiceAgreement(serviceAgreementTemplate: ServiceAgreementTemplate,
                                              serviceAgreementId: string, assetId: string, did: string, values: any[],
                                              timeoutValues: number[], serviceAgreementHashSignature: string,
                                              consumer: Account, publisher: Account):
        Promise<ServiceAgreement> {

        const valueHashes = ServiceAgreement.createValueHashes(values)

        const serviceAgreement: ServiceAgreementContract = await ServiceAgreementContract.getInstance()

        const executeAgreementReceipt = await serviceAgreement.executeAgreement(
            serviceAgreementTemplate.getId(), serviceAgreementHashSignature, consumer.getId(), valueHashes,
            timeoutValues, serviceAgreementId, did, publisher.getId())

        if (executeAgreementReceipt.events.ExecuteAgreement.returnValues.state === false) {
            throw new Error("signing service agreement failed.")
        }

        return new ServiceAgreement(
            serviceAgreementId,
            publisher,
            serviceAgreementTemplate,
            consumer,
            executeAgreementReceipt.events.ExecuteAgreement.returnValues.state,
            executeAgreementReceipt.events.ExecuteAgreement.returnValues.status,
        )
    }

    private static createValueHashes(values: any[]): any[] {
        return values.map((value) => {
            return ServiceAgreement.hashSingleValue(value.type, value.value)
        })
    }

    private static hashSingleValue(type: string, value: any): string {
        const args = {type, value}
        return Web3Provider.getWeb3().utils.soliditySha3(args).toString("hex")
    }

    private static async createSAHashSignature(serviceAgreementTemplate: ServiceAgreementTemplate,
                                               serviceAgreementId: string, values: any[], timeoutValues: number[],
                                               consumer: Account): Promise<string> {

        const valueHashes = ServiceAgreement.createValueHashes(values)

        const serviceAgreementHash = ServiceAgreement.hashServiceAgreement(serviceAgreementTemplate, valueHashes,
            timeoutValues, serviceAgreementId)
        const serviceAgreementHashSignature =
            await Web3Provider.getWeb3().eth.sign(serviceAgreementHash, consumer.getId())

        return serviceAgreementHashSignature
    }

    private static hashServiceAgreement(serviceAgreementTemplate: ServiceAgreementTemplate, valueHashes: string[],
                                        timeouts: number[], serviceAgreementId: string) {
        const args = [
            {type: "bytes32", value: serviceAgreementTemplate.getId()},
            {type: "bytes32[]", value: serviceAgreementTemplate.getConditionKeys()},
            {type: "bytes32[]", value: valueHashes},
            {type: "uint256[]", value: timeouts},
            {type: "bytes32", value: "0x" + serviceAgreementId},
        ]

        return Web3Provider.getWeb3().utils.soliditySha3(...args).toString("hex")
    }

    private constructor(id: string, private publisher: Account, serviceAgreementTemplate: ServiceAgreementTemplate,
                        consumer: Account, state: boolean, status: boolean) {
        super(id)
    }

    public async grantAccess(assetId: string, documentId: string): Promise<boolean> {
        const accessConditions: AccessConditions = await AccessConditions.getInstance()

        const grantAccessReceipt =
            await accessConditions.grantAccess(this.getId(), assetId, documentId, this.publisher.getId())

        return grantAccessReceipt.status
    }

    public async getStatus() {
        const serviceAgreement = await ServiceAgreementContract.getInstance()
        return serviceAgreement.getAgreementStatus(this.getId())
    }
}
