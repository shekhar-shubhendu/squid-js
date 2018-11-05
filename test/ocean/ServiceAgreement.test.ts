import {assert} from "chai"
import AquariusConnectorProvider from "../../src/aquarius/AquariusConnectorProvider"
import ConfigProvider from "../../src/ConfigProvider"
import DDO from "../../src/ddo/DDO"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreement from "../../src/ocean/ServiceAgreement"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreementTemplate"
import config from "../config"
import AquariusConnectorMock from "../mocks/AquariusConnector.mock"
import Service from "../../src/ddo/Service"
import Condition from "../../src/ddo/Condition"

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

        const resourceName = "superb car data"
        const methods: string[] = [
            "PaymentConditions.lockPayment",
            "AccessConditions.grantAccess",
            "PaymentConditions.releasePayment",
            "PaymentConditions.refundPayment",
        ]

        // tslint:disable
        const dependencyMatrix = [0, 1, 4, 1 | 2 ** 4 | 2 ** 5] // dependency bit | timeout bit

        testServiceAgreementTemplate =
            await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, methods,
                dependencyMatrix, templateOwnerAccount)

        // get condition keys from template
        const conditionKeys: string[] = testServiceAgreementTemplate.getConditionKeys()

        // create ddo conditions out of the keys
        const conditions: Condition[] = conditionKeys.map((conditionKey, i): Condition => {
            return {
                name: methods[i].split(".")[1],
                timeout: 100,
                conditionKey: conditionKey,
                parameters: {
                    // todo wtf?
                    assetId: "bytes32",
                    price: "integer"
                },
            } as Condition
        })

        serviceDefintion = [
            {
                serviceDefinitionId: IdGenerator.generateId(),
                templateId: testServiceAgreementTemplate.getId(),
                conditions,
            } as Service
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
                await ServiceAgreement.createServiceAgreement(assetId, ddo, serviceAgreementId, consumerAccount,
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
                await ServiceAgreement.createServiceAgreement(assetId, ddo, serviceAgreementId, consumerAccount,
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
                await ServiceAgreement.createServiceAgreement(assetId, ddo, serviceAgreementId, consumerAccount,
                    publisherAccount)
            assert(serviceAgreement)

            const fulfilled: boolean = await serviceAgreement.grantAccess(assetId, IdGenerator.generateId())
            assert(fulfilled)
        })
    })
})
