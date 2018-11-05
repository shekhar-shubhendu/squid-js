import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "../../src/ocean/ServiceAgreements/Templates/Access"
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
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                await ServiceAgreementTemplate.registerServiceAgreementsTemplate(Access.templateName, Access.Methods,
                    templateOwner)

            assert(serviceAgreementTemplate)
            assert(serviceAgreementTemplate.getId())
            assert(serviceAgreementTemplate.getOwner().getId() === templateOwner.getId())
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly deployed agreement template", async () => {

            const publisherAccount = accounts[0]
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                await ServiceAgreementTemplate.registerServiceAgreementsTemplate(Access.templateName, Access.Methods,
                    publisherAccount)
            assert(serviceAgreementTemplate)

            const templateStatus = await serviceAgreementTemplate.getStatus()
            assert(templateStatus === true)
        })
    })

})
