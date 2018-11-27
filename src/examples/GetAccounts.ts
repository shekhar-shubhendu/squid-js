import {Logger, Ocean} from "../squid"
import * as config from "./config.json"

(async () => {
    const ocean: Ocean = await Ocean.getInstance(config)

    const accounts = await ocean.getAccounts()

    Logger.log(JSON.stringify(accounts, null, 2))
})()
