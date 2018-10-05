import * as assert from "assert"
import ContractHandler from "../../src/keeper/ContractHandler"
import Keeper from "../../src/keeper/Keeper"
import Web3Helper from "../../src/keeper/Web3Helper"
import Config from "../../src/models/Config"
import Logger from "../../src/utils/Logger"

let keeper: Keeper

before(async () => {
    const config: Config = {nodeUri: "http://localhost:8545"} as Config
    const web3Helper = new Web3Helper(config)
    await ContractHandler.deployContracts(web3Helper)
    keeper = await Keeper.getInstance(config, web3Helper)
})

describe("Keeper", () => {

    describe("public interface", () => {

        it("should have market", () => {
            assert(keeper.market !== null)
        })

        it("should have auth", () => {
            assert(keeper.auth !== null)
        })

        it("should have token", () => {
            assert(keeper.token !== null)
        })

        it("should have web3Helper", () => {
            assert(keeper.web3Helper !== null)
        })
    })
})
