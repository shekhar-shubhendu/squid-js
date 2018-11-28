import * as HDWalletProvider from "truffle-hdwallet-provider"
import {Logger, Ocean} from "../squid"
import * as config from "./config.json"

(async () => {
    const seedphrase = "genuine oyster tonight funny fat chimney initial answer potato myself doll enable"

    // @ts-ignore
    config.web3Provider = new HDWalletProvider(
        seedphrase,
        config.nodeUri,
        0, 100,
    )
    const ocean: Ocean = await Ocean.getInstance(config)

    const accounts = await ocean.getAccounts()

    Logger.log(JSON.stringify(accounts, null, 2))
})()
