import * as assert from "assert"
import ContractHandler from "../../src/keeper/ContractHandler"
import Web3Helper from "../../src/keeper/Web3Helper"
import Config from "../../src/models/Config"
import Ocean from "../../src/ocean/Ocean"
import Logger from "../../src/utils/Logger"

let ocean: Ocean

before(async () => {
    const config: Config = {
        nodeUri: "http://localhost:8545",
    } as Config
    const web3Helper = new Web3Helper(config)
    await ContractHandler.deployContracts(web3Helper)
    ocean = await Ocean.getInstance(config)
})

describe("Ocean", () => {

    describe("public interface", () => {

        it("should have tribe", async () => {

            assert(ocean.tribe !== null)
        })

        it("should have account", async () => {

            assert(ocean.account !== null)
        })

        it("should have order", async () => {

            assert(ocean.order !== null)
        })

        it("should have asset", async () => {

            assert(ocean.asset !== null)
        })
    })

})
