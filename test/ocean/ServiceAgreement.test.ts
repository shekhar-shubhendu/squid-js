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
        testServiceAgreementTemplate =
            await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, templateOwnerAccount)

    })

    describe("#executeServiceAgreement()", () => {
        it("should execute an service agreement", async () => {

            const did: string = IdGenerator.generateId()
            const assetId: string = IdGenerator.generateId()

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.signServiceAgreement(testServiceAgreementTemplate, publisherAccount,
                    did, assetId, consumerAccount)

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
                await ServiceAgreement.signServiceAgreement(testServiceAgreementTemplate, publisherAccount,
                    did, assetId, consumerAccount)

            assert(serviceAgreement)
            const status = await serviceAgreement.getStatus()
            assert(status === false)
        })
    })

    describe("#grantAccess()", () => {
        it("should grant access in that service agreement", async () => {

            const did: string = IdGenerator.generateId()
            const assetId: string = IdGenerator.generateId()

            const resourceName = "nice service"
            const serviceAgreementTemplate =
                await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, templateOwnerAccount)

            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.signServiceAgreement(serviceAgreementTemplate, publisherAccount,
                    did, assetId, consumerAccount)
            assert(serviceAgreement)

            const fulfilled: boolean = await serviceAgreement.grantAccess(did, IdGenerator.generateId())
            assert(fulfilled)
        })
    })
})
