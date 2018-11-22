import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import DDOCondition from "../../src/ddo/Condition"
import DDO from "../../src/ddo/DDO"
import Event from "../../src/ddo/Event"
import EventHandlers from "../../src/ddo/EventHandlers"
import MetaData from "../../src/ddo/MetaData"
import Parameter from "../../src/ddo/Parameter"
import Service from "../../src/ddo/Service"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import Condition from "../../src/ocean/ServiceAgreements/Condition"
import ServiceAgreement from "../../src/ocean/ServiceAgreements/ServiceAgreement"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "../../src/ocean/ServiceAgreements/Templates/Access"
import WebServiceConnectorProvider from "../../src/utils/WebServiceConnectorProvider"
import config from "../config"
import TestContractHandler from "../keeper/TestContractHandler"
import WebServiceConnectorMock from "../mocks/WebServiceConnector.mock"

let ocean: Ocean
let accounts: Account[]
let publisherAccount: Account
let consumerAccount: Account

let accessService: Service
let metaDataService: Service

const assetId: string = IdGenerator.generateId()

describe("ServiceAgreement", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await TestContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()

        publisherAccount = accounts[1]
        consumerAccount = accounts[2]

        const metadata = new MetaData()
        const serviceAgreementTemplate: ServiceAgreementTemplate =
            new ServiceAgreementTemplate(new Access())

        // get condition keys from template
        const conditions: Condition[] = await serviceAgreementTemplate.getConditions()

        // create ddo conditions out of the keys
        const ddoConditions: DDOCondition[] = conditions
            .map((condition: Condition, index): DDOCondition => {

                const events: Event[] = [
                    {
                        name: "PaymentReleased",
                        actorType: [
                            "consumer",
                        ],
                        handlers: {
                            moduleName: "serviceAgreement",
                            functionName: "fulfillAgreement",
                            version: "0.1",
                        } as EventHandlers,
                    } as Event,
                ]

                const mapParameterValueToName = (name) => {

                    switch (name) {
                        case "price":
                            return metadata.base.price
                        case "assetId":
                            return "0x" + assetId
                        case "documentKeyId":
                            return "0x" + assetId

                    }

                    return null
                }

                const parameters: Parameter[] = condition.parameters
                    .map((parameter: Parameter) => {
                        return {
                            name: parameter.name,
                            type: parameter.type,
                            value: mapParameterValueToName(parameter.name),
                        } as Parameter
                    })

                return {
                    contractName: condition.methodReflection.contractName,
                    methodName: condition.methodReflection.methodName,
                    timeout: condition.timeout,
                    index,
                    conditionKey: condition.condtionKey,
                    parameters,
                    events,
                    dependencies: condition.dependencies,
                    dependencyTimeoutFlags: condition.dependencyTimeoutFlags,
                    isTerminalCondition: condition.isTerminalCondition,
                } as DDOCondition
            })

        accessService = {
            type: "Access",
            serviceDefinitionId: IdGenerator.generateId(),
            templateId: serviceAgreementTemplate.getId(),
            conditions: ddoConditions,
        } as Service

        metaDataService = {
            type: "MetaData",
            metadata,
        } as Service
    })

    describe("#signServiceAgreement()", () => {
        it("should sign an service agreement", async () => {

            const did: string = `did:op:${assetId}`
            const ddo = new DDO({id: did, service: [accessService]})
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))

            const serviceAgreementSignature: string =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, consumerAccount)

            assert(serviceAgreementSignature)
            assert(serviceAgreementSignature.startsWith("0x"))
        })
    })

    describe("#executeServiceAgreement()", () => {
        it("should execute an service agreement", async () => {

            const did: string = `did:op:${assetId}`
            const ddo = new DDO({id: did, service: [accessService]})
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))
            const serviceAgreementSignature: string =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, consumerAccount)

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, serviceAgreementSignature, consumerAccount, publisherAccount)
            assert(serviceAgreement)

            const serviceDefinitionId = serviceAgreement.getId()
            assert(serviceDefinitionId)
            assert(serviceDefinitionId !== did)
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly created service agreement", async () => {

            const did: string = `did:op:${assetId}`
            const ddo = new DDO({id: did, service: [accessService]})
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))
            const serviceAgreementSignature: string =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, consumerAccount)
            assert(serviceAgreementSignature)

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, serviceAgreementSignature, consumerAccount, publisherAccount)
            assert(serviceAgreement)

            const status = await serviceAgreement.getStatus()
            assert(status === false)
        })
    })

    describe("#buyAsset()", () => {
        it("should lock the payment in that service agreement", async () => {

            const did: string = `did:op:${assetId}`
            const ddo = new DDO({id: did, service: [accessService, metaDataService]})
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))

            const serviceAgreementSignature: string =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, consumerAccount)
            assert(serviceAgreementSignature)

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, serviceAgreementSignature, consumerAccount, publisherAccount)
            assert(serviceAgreement)

            // get funds
            await consumerAccount.requestTokens(metaDataService.metadata.base.price)

            const paid: boolean = await serviceAgreement.buyAsset(assetId, metaDataService.metadata.base.price,
                consumerAccount)
            assert(paid)
        })
    })

    describe("#grantAccess()", () => {
        it("should grant access in that service agreement", async () => {

            const did: string = `did:op:${assetId}`
            const ddo = new DDO({id: did, service: [accessService]})
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))
            const serviceAgreementSignature: string =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, consumerAccount)
            assert(serviceAgreementSignature)

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, serviceAgreementSignature, consumerAccount, publisherAccount)
            assert(serviceAgreement)

            // get funds
            await consumerAccount.requestTokens(metaDataService.metadata.base.price)

            const paid: boolean = await serviceAgreement.buyAsset(assetId, metaDataService.metadata.base.price,
                consumerAccount)
            assert(paid)

            // todo: use document id
            const accessGranted: boolean = await serviceAgreement.grantAccess(assetId, assetId)
            assert(accessGranted)
        })

        it("should fail to grant grant access if there is no payment", async () => {

            const did: string = `did:op:${assetId}`
            const ddo = new DDO({id: did, service: [accessService]})
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            WebServiceConnectorProvider.setConnector(new WebServiceConnectorMock(ddo))
            const serviceAgreementSignature: string =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, consumerAccount)
            assert(serviceAgreementSignature)

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(assetId, ddo, accessService.serviceDefinitionId,
                    serviceAgreementId, serviceAgreementSignature, consumerAccount, publisherAccount)
            assert(serviceAgreement)

            // todo: use document id
            const accessGranted: boolean = await serviceAgreement.grantAccess(assetId, assetId)
            assert(!accessGranted)
        })
    })
})
