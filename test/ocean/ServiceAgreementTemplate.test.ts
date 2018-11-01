import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreementTemplate"
import config from "../config"

let ocean: Ocean
let accounts: Account[]

describe("ServiceAgreementTemplate", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()
    })

    describe("#registerServiceAgreementsTemplate()", () => {
        it("should setup an agreement template", async () => {

            const templateOwner = accounts[0]
            const resourceName = "test data"
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, templateOwner)
            assert(serviceAgreementTemplate)
            assert(serviceAgreementTemplate.getId())
            assert(serviceAgreementTemplate.getOwner().getId() === templateOwner.getId())
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly deployed agreement template", async () => {

            const publisherAccount = accounts[0]
            const resourceName = "template status"
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, publisherAccount)

            const templateStatus = await serviceAgreementTemplate.getStatus()
            assert(templateStatus === true)
        })
    })

})
