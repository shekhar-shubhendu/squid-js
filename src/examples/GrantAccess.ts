import DDO from "../ddo/DDO"
import ServiceAgreement from "../ocean/ServiceAgreement"
import {Account, Asset, Logger, Ocean} from "../squid"

(async () => {
    const ocean: Ocean = await Ocean.getInstance({
        nodeUri: "http://localhost:8545",
        aquariusUri: "http://localhost:5000",
        parityUri: "http://localhost:9545",
        secretStoreUri: "https://secret-store.dev-ocean.com",
        threshold: 2,
        password: "unittest",
        address: "0xed243adfb84a6626eba46178ccb567481c6e655d",
    })

    const publisher: Account = (await ocean.getAccounts())[0]
    const consumer: Account = (await ocean.getAccounts())[0]

    const asset: Asset = new Asset(
        "Fancy Car Data",
        "nice data",
        100, publisher)

    const ddo: DDO = await ocean.register(asset)
    Logger.log("asset did:", ddo.id)

    const serviceAgreement: ServiceAgreement = await asset.purchase(consumer)
    Logger.log("service agreement id:", serviceAgreement.getId())

    const accessGranted: boolean =
        await serviceAgreement.grantAccess(asset.getId(), "321721938712931283")

    Logger.log("access granted:", accessGranted)
})()
