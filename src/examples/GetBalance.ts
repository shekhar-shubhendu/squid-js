import {Logger, Ocean} from "../squid"
import * as config from "./config.json"

(async () => {
    const ocean: Ocean = await Ocean.getInstance(config)

    const accounts = await ocean.getAccounts()

    Logger.log(await accounts[0].getBalance())
})()
