import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreement from "../../src/ocean/ServiceAgreement"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreementTemplate"
import config from "../config"

let ocean: Ocean
let accounts: Account[]
let publisherAccount: Account
let templateOwnerAccount: Account
let consumerAccount: Account

let testServiceAgreementTemplate: ServiceAgreementTemplate

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
    })

    describe("#createServiceAgreement()", () => {
        it("should execute an service agreement", async () => {

            const did: string = IdGenerator.generateId()
            const assetId: string = IdGenerator.generateId()

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.createServiceAgreement(testServiceAgreementTemplate, assetId, did,
                    consumerAccount, publisherAccount)

            assert(serviceAgreement)
            const id = serviceAgreement.getId()
            assert(id)
            assert(id !== did)
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly created service agreement", async () => {

            const did: string = IdGenerator.generateId()
            const assetId: string = IdGenerator.generateId()

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.createServiceAgreement(testServiceAgreementTemplate, assetId, did,
                    consumerAccount, publisherAccount)

            assert(serviceAgreement)
            const status = await serviceAgreement.getStatus()
            assert(status === false)
        })
    })

    describe("#grantAccess()", () => {
        it("should grant access in that service agreement", async () => {

            const did: string = IdGenerator.generateId()
            const assetId: string = IdGenerator.generateId()

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.createServiceAgreement(testServiceAgreementTemplate, assetId, did,
                    consumerAccount, publisherAccount)
            assert(serviceAgreement)

            const fulfilled: boolean = await serviceAgreement.grantAccess(did, IdGenerator.generateId())
            assert(fulfilled)
        })
    })
})
