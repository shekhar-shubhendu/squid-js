import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "../../src/ocean/ServiceAgreements/Templates/Access"
import TemplateBase from "../../src/ocean/ServiceAgreements/Templates/TemplateBase"
import config from "../config"

let ocean: Ocean
let accounts: Account[]

describe("ServiceAgreementTemplate", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()
    })

    describe("#register()", () => {
        it("should setup an Access agreement template correctly", async () => {

            const templateOwner = accounts[0]
            const access: TemplateBase = new Access()
            access.id = IdGenerator.generatePrefixedId()
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                new ServiceAgreementTemplate(access)
            assert(serviceAgreementTemplate)

            const registered: boolean = await serviceAgreementTemplate.register(templateOwner.getId())
            assert(registered)

            assert(serviceAgreementTemplate.getId())
            assert((await serviceAgreementTemplate.getOwner()).getId() === templateOwner.getId())
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly deployed agreement template", async () => {

            const publisherAccount = accounts[0]
            const access: TemplateBase = new Access()
            access.id = IdGenerator.generatePrefixedId()
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                new ServiceAgreementTemplate(access)
            assert(serviceAgreementTemplate)

            const registered: boolean = await serviceAgreementTemplate.register(publisherAccount.getId())
            assert(registered)

            const templateStatus = await serviceAgreementTemplate.getStatus()
            assert(templateStatus === true)
        })
    })

})
