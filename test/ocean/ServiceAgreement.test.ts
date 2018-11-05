import {assert} from "chai"
import AquariusConnectorProvider from "../../src/aquarius/AquariusConnectorProvider"
import ConfigProvider from "../../src/ConfigProvider"
import DDOCondition from "../../src/ddo/Condition"
import DDO from "../../src/ddo/DDO"
import Parameter from "../../src/ddo/Parameter"
import Service from "../../src/ddo/Service"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import Condition from "../../src/ocean/ServiceAgreements/Condition"
import ServiceAgreement from "../../src/ocean/ServiceAgreements/ServiceAgreement"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "../../src/ocean/ServiceAgreements/Templates/Access"
import config from "../config"
import AquariusConnectorMock from "../mocks/AquariusConnector.mock"

let ocean: Ocean
let accounts: Account[]
let publisherAccount: Account
let templateOwnerAccount: Account
let consumerAccount: Account

let testServiceAgreementTemplate: ServiceAgreementTemplate
let serviceDefintion

describe("ServiceAgreement", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()

        templateOwnerAccount = accounts[0]
        publisherAccount = accounts[1]
        consumerAccount = accounts[2]

        testServiceAgreementTemplate =
            await ServiceAgreementTemplate.registerServiceAgreementsTemplate(Access.templateName, Access.Methods,
                templateOwnerAccount)

        // get condition keys from template
        const conditions: Condition[] = testServiceAgreementTemplate.getConditions()

        // create ddo conditions out of the keys
        const ddoConditions: DDOCondition[] = conditions.map((condition): DDOCondition => {
            return {
                name: condition.methodReflection.methodName,
                timeout: 100,
                conditionKey: condition.condtionKey,
                parameters: condition.methodReflection.inputs.map((input) => {
                    return {
                        ...input,
                        value: "xx",
                    }as Parameter
                }),
            } as DDOCondition
        })

        serviceDefintion = [
            {
                serviceDefinitionId: IdGenerator.generateId(),
                templateId: testServiceAgreementTemplate.getId(),
                conditions: ddoConditions,
            } as Service,
        ]

    })

    describe("#createServiceAgreement()", () => {
        it("should execute an service agreement", async () => {

            const id: string = IdGenerator.generateId()
            const did: string = `did:op:${id}`
            const ddo = new DDO({id: did, service: serviceDefintion})
            const assetId: string = IdGenerator.generateId()
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            AquariusConnectorProvider.setConnector(new AquariusConnectorMock(ddo))
            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, serviceAgreementId, consumerAccount,
                    publisherAccount)
            assert(serviceAgreement)

            const serviceDefinitionId = serviceAgreement.getId()
            assert(serviceDefinitionId)
            assert(serviceDefinitionId !== did)
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly created service agreement", async () => {

            const id: string = IdGenerator.generateId()
            const did: string = `did:op:${id}`
            const ddo = new DDO({id: did, service: serviceDefintion})
            const assetId: string = IdGenerator.generateId()
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            AquariusConnectorProvider.setConnector(new AquariusConnectorMock(ddo))
            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, serviceAgreementId, consumerAccount,
                    publisherAccount)
            assert(serviceAgreement)

            const status = await serviceAgreement.getStatus()
            assert(status === false)
        })
    })

    describe("#grantAccess()", () => {
        it("should grant access in that service agreement", async () => {

            const id: string = IdGenerator.generateId()
            const did: string = `did:op:${id}`
            const ddo = new DDO({id: did, service: serviceDefintion})
            const assetId: string = IdGenerator.generateId()
            const serviceAgreementId: string = IdGenerator.generateId()

            // @ts-ignore
            AquariusConnectorProvider.setConnector(new AquariusConnectorMock(ddo))
            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.signServiceAgreement(assetId, ddo, serviceAgreementId, consumerAccount,
                    publisherAccount)
            assert(serviceAgreement)

            const fulfilled: boolean = await serviceAgreement.grantAccess(assetId, IdGenerator.generateId())
            assert(fulfilled)
        })
    })
})
