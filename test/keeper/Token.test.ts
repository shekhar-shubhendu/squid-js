import ContractHandler from "../../src/keeper/ContractHandler"
import Token from "../../src/keeper/Token"
import Web3Helper from "../../src/keeper/Web3Helper"
import Config from "../../src/models/Config"
import Logger from "../../src/utils/Logger"

let token: Token

before(async () => {
    const config: Config = {nodeUri: "http://localhost:8545"} as Config
    const web3Helper = new Web3Helper(config)
    await ContractHandler.deployContracts(web3Helper)
    token = await Token.getInstance(config, web3Helper)
})

describe("Token", () => {

    describe("#balanceOf()", () => {

        it("should get balance", async () => {

            const balance = await token.balanceOf("0xB0EdD05A5874c5c1Fcd6bCB4E52143fB7134b7EE")

            Logger.log(balance)
        })
    })

})
