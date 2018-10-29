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

            const publisherAccount = accounts[0]
            const resourceName = "test data"
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                await ServiceAgreementTemplate.registerServiceAgreementsTemplate(resourceName, publisherAccount)
            assert(serviceAgreementTemplate)
            assert(serviceAgreementTemplate.getId())
            assert(serviceAgreementTemplate.getPublisher().getId() === publisherAccount.getId())
        })
    })

})
