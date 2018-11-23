import {Logger, Ocean} from "../squid"
// tslint:disable-next-line
import EventListener from "../keeper/EventListener"

(async () => {
    Ocean.getInstance({
        nodeUri: "http://localhost:8545",
        aquariusUri: "http://localhost:5000",
        brizoUri: "http://localhost:8030",
        parityUri: "http://localhost:9545",
        secretStoreUri: "http://localhost:12001",
        threshold: 0,
        password: "unittest",
        address: "0xed243adfb84a6626eba46178ccb567481c6e655d",
    })
})()

const event = EventListener.subscribe("OceanToken", "Transfer", {})

Logger.log(`Listening to Transfer event of OceanToken`)

event.listen((data: any[]) => {

    Logger.log(Date.now())
    Logger.log("From", data[0].returnValues.from)
    Logger.log("To", data[0].returnValues.to)
    Logger.log("Value", data[0].returnValues.value)
})
