import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreementTemplate from "../../src/ocean/ServiceAgreements/ServiceAgreementTemplate"
import Access from "../../src/ocean/ServiceAgreements/Templates/Access"
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
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                new ServiceAgreementTemplate(new Access(IdGenerator.generateId()))
            assert(serviceAgreementTemplate)

            await serviceAgreementTemplate.register(templateOwner.getId())

            assert(serviceAgreementTemplate.getId())
            assert((await serviceAgreementTemplate.getOwner()).getId() === templateOwner.getId())
        })
    })

    describe("#getStatus()", () => {
        it("should get the status of a newly deployed agreement template", async () => {

            const publisherAccount = accounts[0]
            const serviceAgreementTemplate: ServiceAgreementTemplate =
                new ServiceAgreementTemplate(new Access(IdGenerator.generateId()))
            assert(serviceAgreementTemplate)

            await serviceAgreementTemplate.register(publisherAccount.getId())

            const templateStatus = await serviceAgreementTemplate.getStatus()
            assert(templateStatus === true)
        })
    })

})
