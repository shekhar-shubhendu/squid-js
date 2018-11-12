import DDO from "../ddo/DDO"
import {Logger, Ocean} from "../squid"

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

    const result: DDO[] = await ocean.searchAssetsByText("Office Humidity")
    const dids = result.map((res: DDO) => {
        return res.id
    })

    Logger.log(dids.length, JSON.stringify(dids, null, 2))
})()
