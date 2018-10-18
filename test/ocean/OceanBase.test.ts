import {assert} from "chai"
import OceanBaseMock from "../mocks/OceanBase.Mock"

describe("OceanBase", () => {

    describe("#getId()", () => {

        it("should get the id", async () => {

            const id = "test"
            const oceanBase = new OceanBaseMock(id)

            assert(oceanBase.getId() === id)
        })

    })

    describe("#setId()", () => {

        it("should get the id", async () => {

            const id = "test"
            const oceanBase = new OceanBaseMock()
            oceanBase.setId(id)

            assert(oceanBase.getId() === id)
        })
    })

})
