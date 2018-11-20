import Condition from "../../ddo/Condition"
import DDO from "../../ddo/DDO"
import Service from "../../ddo/Service"
import Keeper from "../../keeper/Keeper"
import Web3Provider from "../../keeper/Web3Provider"
import ValuePair from "../../models/ValuePair"
import Logger from "../../utils/Logger"
import Account from "../Account"
import OceanBase from "../OceanBase"

export default class ServiceAgreement extends OceanBase {

    public static async signServiceAgreement(assetId: string, ddo: DDO, serviceDefinitionId: string,
                                             serviceAgreementId: string, consumer: Account):
        Promise<string> {

        const service: Service = ddo.findServiceById(serviceDefinitionId)
        const values: ValuePair[] = ServiceAgreement.getValuesFromService(service, serviceAgreementId)
        const valueHashes = ServiceAgreement.createValueHashes(values)
        const timeoutValues: number[] = ServiceAgreement.getTimeoutValuesFromService(service)

        const serviceAgreementHashSignature = await ServiceAgreement.createSAHashSignature(service, serviceAgreementId,
            values, valueHashes, timeoutValues, consumer)

        return serviceAgreementHashSignature
    }

    public static async executeServiceAgreement(assetId: string, ddo: DDO, serviceDefinitionId: string,
                                                serviceAgreementId: string, serviceAgreementHashSignature: string,
                                                consumer: Account, publisher: Account): Promise<ServiceAgreement> {

        const service: Service = ddo.findServiceById(serviceDefinitionId)
        const values: ValuePair[] = ServiceAgreement.getValuesFromService(service, serviceAgreementId)
        const valueHashes = ServiceAgreement.createValueHashes(values)
        const timeoutValues: number[] = ServiceAgreement.getTimeoutValuesFromService(service)

        const serviceAgreement: ServiceAgreement = await ServiceAgreement.executeAgreement(ddo,
            serviceDefinitionId, serviceAgreementId, valueHashes, timeoutValues, serviceAgreementHashSignature,
            consumer, publisher)

        return serviceAgreement
    }

    private static async createSAHashSignature(service: Service, serviceAgreementId: string, values: ValuePair[],
                                               valueHashes: string[], timeoutValues: number[], consumer: Account):
        Promise<string> {

        if (!service.templateId) {
            throw new Error("TemplateId not found in ddo.")
        }

        const conditionKeys: string[] = service.conditions.map((condition) => {
            return condition.conditionKey
        })

        const serviceAgreementHash = ServiceAgreement.hashServiceAgreement(service.templateId,
            serviceAgreementId, conditionKeys, valueHashes, timeoutValues)

        const serviceAgreementHashSignature =
            await Web3Provider.getWeb3().eth.sign(serviceAgreementHash, consumer.getId())

        return serviceAgreementHashSignature
    }

    private static async executeAgreement(ddo: DDO, serviceDefinitionId: string, serviceAgreementId: string,
                                          valueHashes: string[], timeoutValues: number[],
                                          serviceAgreementHashSignature: string, consumer: Account, publisher: Account)
        : Promise<ServiceAgreement> {

        const {serviceAgreement} = await Keeper.getInstance()

        const service: Service = ddo.findServiceById(serviceDefinitionId)

        if (!service.templateId) {
            throw new Error(`TemplateId not found in service "${service.type}" ddo.`)
        }

        const executeAgreementReceipt = await serviceAgreement.executeAgreement(
            service.templateId, serviceAgreementHashSignature, consumer.getId(), valueHashes,
            timeoutValues, serviceAgreementId, ddo.id, publisher.getId())

        if (executeAgreementReceipt.events.ExecuteAgreement.returnValues.state === false) {
            throw new Error("executing service agreement failed.")
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
        try {
            return Web3Provider.getWeb3().utils.soliditySha3(data).toString("hex")
        } catch (err) {
            Logger.error(`Hashing of ${JSON.stringify(data, null, 2)} failed.`)
        }
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

    private static getTimeoutValuesFromService(service: Service): number[] {
        const timeoutValues: number[] = service.conditions.map((condition: Condition) => {
            return condition.timeout
        })

        return timeoutValues
    }

    private static getValuesFromService(service: Service, serviceAgreementId: string): ValuePair[] {

        const values: ValuePair[] = []

        service.conditions.forEach((condition) => {
            condition.parameters.forEach((parameter) => {
                values.push({
                    type: parameter.type,
                    value: parameter.name === "serviceId" ? "0x" + serviceAgreementId : parameter.value,
                } as ValuePair)
            })
        })

        // Logger.log("Values", JSON.stringify(values, null, 2))

        return values
    }

    private constructor(serviceAgreementId: string, ddo: DDO, private publisher: Account, consumer: Account,
                        state: boolean, status: boolean) {
        super(serviceAgreementId)
    }

    public async lockPayment(assetId: string, price: number, consumer: Account): Promise<boolean> {
        const {paymentConditions} = await Keeper.getInstance()

        const lockPaymentRceipt =
            await paymentConditions.lockPayment(this.getId(), assetId, price,
                consumer.getId())

        return lockPaymentRceipt.status
    }

    public async grantAccess(assetId: string, documentId: string): Promise<boolean> {
        const {accessConditions} = await Keeper.getInstance()

        const grantAccessReceipt =
            await accessConditions.grantAccess(this.getId(), assetId, documentId,
                this.publisher.getId())

        return grantAccessReceipt.status
    }

    public async getStatus() {
        const {serviceAgreement} = await Keeper.getInstance()
        return serviceAgreement.getAgreementStatus(this.getId())
    }
}
