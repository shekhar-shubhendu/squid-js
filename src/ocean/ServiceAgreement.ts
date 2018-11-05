import DDO from "../ddo/DDO"
import AccessConditions from "../keeper/contracts/conditions/AccessConditions"
import ServiceAgreementContract from "../keeper/contracts/ServiceAgreement"
import Web3Provider from "../keeper/Web3Provider"
import Account from "./Account"
import OceanBase from "./OceanBase"

export default class ServiceAgreement extends OceanBase {

    public static async createServiceAgreement(assetId: string, ddo: DDO, serviceAgreementId: string, consumer: Account,
                                               publisher: Account):
        Promise<ServiceAgreement> {

        const timeoutValues: number[] = ddo.service[0].conditions.map((condition) => {
            return condition.timeout
        })

        // todo: this should come from ddo
        const values = [
            {type: "bool", value: true},
            {type: "bool", value: false},
            {type: "uint", value: 120},
            {type: "string", value: serviceAgreementId},
        ]

        const serviceAgreementHashSignature = await ServiceAgreement.createSAHashSignature(ddo, serviceAgreementId,
            consumer)

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.signServiceAgreement(ddo,
            serviceAgreementId, values, timeoutValues, serviceAgreementHashSignature, consumer, publisher)

        return serviceAgreement
    }

    public static async createSAHashSignature(ddo: DDO, serviceAgreementId: string, consumer: Account):
        Promise<string> {

        // todo get from ddo
        const values = [
            {type: "bool", value: true},
            {type: "bool", value: false},
            {type: "uint", value: 120},
            {type: "string", value: serviceAgreementId},
        ]

        const valueHashes = ServiceAgreement.createValueHashes(values)

        const conditionKeys: string[] = ddo.service[0].conditions.map((condition) => {
            return condition.conditionKey
        })

        const timeoutValues: number[] = ddo.service[0].conditions.map((condition) => {
            return condition.timeout
        })

        const serviceAgreementHash = ServiceAgreement.hashServiceAgreement(ddo.service[0].templateId,
            serviceAgreementId, conditionKeys, valueHashes, timeoutValues)

        const serviceAgreementHashSignature =
            await Web3Provider.getWeb3().eth.sign(serviceAgreementHash, consumer.getId())

        return serviceAgreementHashSignature
    }

    private static async signServiceAgreement(ddo: DDO, serviceAgreementId: string, values: any[],
                                              timeoutValues: number[], serviceAgreementHashSignature: string,
                                              consumer: Account, publisher: Account):
        Promise<ServiceAgreement> {

        const valueHashes = ServiceAgreement.createValueHashes(values)
        const serviceAgreement: ServiceAgreementContract = await ServiceAgreementContract.getInstance()
        const executeAgreementReceipt = await serviceAgreement.executeAgreement(
            ddo.service[0].templateId, serviceAgreementHashSignature, consumer.getId(), valueHashes,
            timeoutValues, serviceAgreementId, ddo.id, publisher.getId())

        if (executeAgreementReceipt.events.ExecuteAgreement.returnValues.state === false) {
            throw new Error("signing service agreement failed.")
        }

        return new ServiceAgreement(
            executeAgreementReceipt.events.ExecuteAgreement.returnValues.serviceAgreementId,
            ddo,
            publisher,
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

    private static hashServiceAgreement(serviceAgreementTemplateId: string, serviceAgreementId: string,
                                        conditionKeys: string[], valueHashes: string[], timeouts: number[]) {
        const args = [
            {type: "bytes32", value: serviceAgreementTemplateId},
            {type: "bytes32[]", value: conditionKeys},
            {type: "bytes32[]", value: valueHashes},
            {type: "uint256[]", value: timeouts},
            {type: "bytes32", value: serviceAgreementId},
        ]

        return Web3Provider.getWeb3().utils.soliditySha3(...args).toString("hex")
    }

    private constructor(serviceAgreementId: string, ddo: DDO, private publisher: Account, consumer: Account,
                        state: boolean, status: boolean) {
        super(serviceAgreementId)
    }

    public async grantAccess(assetId: string, documentId: string): Promise<boolean> {
        const accessConditions: AccessConditions = await AccessConditions.getInstance()

        const grantAccessReceipt =
            await accessConditions.grantAccess(this.getId(), assetId, documentId,
                this.publisher.getId())

        return grantAccessReceipt.status
    }

    public async getStatus() {
        const serviceAgreement = await ServiceAgreementContract.getInstance()
        return serviceAgreement.getAgreementStatus(this.getId())
    }
}
