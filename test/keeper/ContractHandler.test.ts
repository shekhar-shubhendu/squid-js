import {assert} from "chai"
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
            assert(await ContractHandler.get("OceanToken"))
        })

        it("should fail to load an unknown contract", (done) => {

            ContractHandler.get("OceanXXX")
                .catch(() => {

                    done()
                })
        })
    })
})
