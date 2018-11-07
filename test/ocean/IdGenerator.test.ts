import * as assert from "assert"
import IdGenerator from "../../src/ocean/IdGenerator"

describe("IdGenerator", () => {

    describe("#generateId()", () => {

        it("should generate an id", async () => {

            const id = IdGenerator.generateId()
            assert(id)
        })

        it("should generate an id that is 64 chars long", async () => {

            const id: string = IdGenerator.generateId()
            assert(id.length === 64, id)
        })

        it("should not contain -", async () => {

            const id: string = IdGenerator.generateId()
            assert(id.indexOf("-") === -1)
        })
    })

    describe("#generatePrefixedId()", () => {

        it("should generate an id", async () => {

            const id = IdGenerator.generatePrefixedId()
            assert(id)
        })

        it("should generate an id that is 64 chars long", async () => {

            const id: string = IdGenerator.generatePrefixedId()
            assert(id.length === 66, id)
        })

        it("should be prefixed", async () => {

            const id: string = IdGenerator.generatePrefixedId()
            assert(id.startsWith("0x"))
        })

        it("should not contain -", async () => {

            const id: string = IdGenerator.generatePrefixedId()
            assert(id.indexOf("-") === -1)
        })
    })
})
