import {Account, Logger, Ocean, ServiceAgreementTemplate, Templates} from "../squid"

(async () => {
    const ocean: Ocean = await Ocean.getInstance({
        nodeUri: "http://localhost:8545",
        aquariusUri: "http://localhost:5000",
        brizoUri: "http://localhost:8030",
        parityUri: "http://localhost:9545",
        secretStoreUri: "https://secret-store.dev-ocean.com",
        threshold: 2,
        password: "unittest",
        address: "0xed243adfb84a6626eba46178ccb567481c6e655d",
    })

    const templateOwner: Account = (await ocean.getAccounts())[5]

    const serviceAgreementTemplate: ServiceAgreementTemplate = new ServiceAgreementTemplate(new Templates.Access())
    const serviceAgreementRegistered: boolean = await serviceAgreementTemplate.register(templateOwner.getId())

    Logger.log("ServiceAgreement registered:", serviceAgreementRegistered,
        "templateId:", serviceAgreementTemplate.getId())
})()
