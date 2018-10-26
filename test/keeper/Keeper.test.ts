import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Keeper from "../../src/keeper/Keeper"
import config from "../config"

let keeper: Keeper

describe("Keeper", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await ContractHandler.deployContracts()
        keeper = await Keeper.getInstance()
    })
    
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
    })

    describe("#getNetworkName()", () => {

        it("should get development as default", async () => {
            const networkName: string = await keeper.getNetworkName()
            assert(networkName === "development")
        })

    })
})
