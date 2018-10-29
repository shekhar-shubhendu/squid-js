import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreement from "../../src/ocean/ServiceAgreement"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreementTemplate"
import config from "../config"
import Logger from "../../src/utils/Logger"

let ocean: Ocean
let accounts: Account[]
let testServiceAgreementTemplate: ServiceAgreementTemplate

describe("ServiceAgreement", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()

        const publisherAccount = accounts[0]
        const resourceName = "superb car data"
        testServiceAgreementTemplate =
            await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, publisherAccount)

    })

    describe("#executeServiceAgreement()", () => {
        it("should execture an service agreement", async () => {

            const consumerAccount = accounts[0]
            const did: string = IdGenerator.generateId()
            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(testServiceAgreementTemplate, did, consumerAccount)

            assert(serviceAgreement)
            assert(serviceAgreement.getId().startsWith("0x"))
        })
    })

    describe("#getStatus()", () => {
        it("should execture an service agreement", async () => {

            const consumerAccount = accounts[0]
            const did: string = IdGenerator.generateId()
            const serviceAgreement: ServiceAgreement =
                await ServiceAgreement.executeServiceAgreement(testServiceAgreementTemplate, did, consumerAccount)

            const status = await serviceAgreement.getStatus()
            Logger.log(status)
        })
    })
})
