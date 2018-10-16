import * as assert from "assert"
import OceanBase from "./OceanBaseMock"

describe("OceanBase", () => {

    describe("#getId()", () => {

        it("should get the id", async () => {

            const id = "test"
            const oceanBase = new OceanBase(id)

            assert(oceanBase.getId() === id)
        })

    })

    describe("#setId()", () => {

        it("should get the id", async () => {

            const id = "test"
            const oceanBase = new OceanBase()
            oceanBase.setId(id)

            assert(oceanBase.getId() === id)
        })
    })

})
