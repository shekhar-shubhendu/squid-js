import * as assert from "assert"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import config from "../config"

before(async () => {
    ConfigProvider.configure(config)
    await ContractHandler.deployContracts()
})

describe("ContractHandler", () => {

    describe("#get()", () => {

        it("should load and get OceanToken correctly", async () => {
            assert(await ContractHandler.get("OceanToken") !== null)
        })

    })
})
