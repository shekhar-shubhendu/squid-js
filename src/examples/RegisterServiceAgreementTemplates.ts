import {Account, Logger, Ocean, ServiceAgreementTemplate, Templates} from "../squid"
import * as config from "./config.json"

(async () => {
    const ocean: Ocean = await Ocean.getInstance(config)

    const templateOwner: Account = (await ocean.getAccounts())[5]

    const serviceAgreementTemplate: ServiceAgreementTemplate = new ServiceAgreementTemplate(new Templates.Access())
    const serviceAgreementRegistered: boolean = await serviceAgreementTemplate.register(templateOwner.getId())

    Logger.log("ServiceAgreement registered:", serviceAgreementRegistered,
        "templateId:", serviceAgreementTemplate.getId())
})()
