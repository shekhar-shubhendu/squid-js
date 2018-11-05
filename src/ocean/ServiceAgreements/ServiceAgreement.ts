import DDO from "../../ddo/DDO"
import AccessConditions from "../../keeper/contracts/conditions/AccessConditions"
import ServiceAgreementContract from "../../keeper/contracts/ServiceAgreement"
import Web3Provider from "../../keeper/Web3Provider"
import ValuePair from "../../models/ValuePair"
import Account from "../Account"
import OceanBase from "../OceanBase"

export default class ServiceAgreement extends OceanBase {

    public static async signServiceAgreement(assetId: string, ddo: DDO, serviceAgreementId: string, consumer: Account,
                                             publisher: Account):
        Promise<ServiceAgreement> {

        const values: ValuePair[] = ServiceAgreement.getValuesFromDDO(ddo, serviceAgreementId)
        const valueHashes = ServiceAgreement.createValueHashes(values)
        const timeoutValues: number[] = ServiceAgreement.getTimeoutValuesFromDDO(ddo)

        const serviceAgreementHashSignature = await ServiceAgreement.createSAHashSignature(ddo, serviceAgreementId,
            values, valueHashes, timeoutValues, consumer)

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.executeAgreement(ddo,
            serviceAgreementId, values, valueHashes, timeoutValues, serviceAgreementHashSignature, consumer, publisher)

        return serviceAgreement
    }

    public static async createSAHashSignature(ddo: DDO, serviceAgreementId: string, values: ValuePair[],
                                              valueHashes: string[], timeoutValues: number[], consumer: Account):
        Promise<string> {

        const conditionKeys: string[] = ddo.service[0].conditions.map((condition) => {
            return condition.conditionKey
        })

        const serviceAgreementHash = ServiceAgreement.hashServiceAgreement(ddo.service[0].templateId,
            serviceAgreementId, conditionKeys, valueHashes, timeoutValues)

        const serviceAgreementHashSignature =
            await Web3Provider.getWeb3().eth.sign(serviceAgreementHash, consumer.getId())

        return serviceAgreementHashSignature
    }

    private static async executeAgreement(ddo: DDO, serviceAgreementId: string, values: ValuePair[],
                                          valueHashes: string[], timeoutValues: number[],
                                          serviceAgreementHashSignature: string, consumer: Account,
                                          publisher: Account): Promise<ServiceAgreement> {

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

    private static createValueHashes(valuePairs: ValuePair[]): any[] {
        return valuePairs.map((valuePair) => {
            return ServiceAgreement.hashSingleValue(valuePair)
        })
    }

    private static hashSingleValue(data: ValuePair): string {
        return Web3Provider.getWeb3().utils.soliditySha3(data).toString("hex")
    }

    private static hashServiceAgreement(serviceAgreementTemplateId: string, serviceAgreementId: string,
                                        conditionKeys: string[], valueHashes: string[], timeouts: number[])
        : string {
        const args = [
            {type: "bytes32", value: serviceAgreementTemplateId} as ValuePair,
            {type: "bytes32[]", value: conditionKeys} as ValuePair,
            {type: "bytes32[]", value: valueHashes} as ValuePair,
            {type: "uint256[]", value: timeouts} as ValuePair,
            {type: "bytes32", value: serviceAgreementId} as ValuePair,
        ]

        return Web3Provider.getWeb3().utils.soliditySha3(...args).toString("hex")
    }

    private static getTimeoutValuesFromDDO(ddo: DDO): number[] {
        const timeoutValues: number[] = ddo.service[0].conditions.map((condition) => {
            return condition.timeout
        })

        return timeoutValues
    }

    private static getValuesFromDDO(ddo: DDO, serviceAgreementId: string): ValuePair[] {
        const values: ValuePair[] = [
            {type: "bool", value: true} as ValuePair,
            {type: "bool", value: false} as ValuePair,
            {type: "bool", value: false} as ValuePair,
            {type: "uint", value: 120} as ValuePair,
            {type: "string", value: serviceAgreementId} as ValuePair,
        ]

        return values
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
