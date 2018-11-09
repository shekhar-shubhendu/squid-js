import DDO from "../ddo/DDO"
import MetaData from "../ddo/MetaData"
import {Account, Logger, Ocean} from "../squid"

(async () => {
    const ocean: Ocean = await Ocean.getInstance({
        nodeUri: "http://localhost:8545",
        aquariusUri: "http://localhost:5000",
        brizoUri: "https://localhost:8030",
        parityUri: "http://localhost:9545",
        secretStoreUri: "https://secret-store.dev-ocean.com",
        threshold: 2,
        password: "unittest",
        address: "0xed243adfb84a6626eba46178ccb567481c6e655d",
    })

    const publisher: Account = (await ocean.getAccounts())[0]

    const ddo: DDO = await ocean.registerAsset(new MetaData(), publisher)
    Logger.log(ddo.id)
})()
