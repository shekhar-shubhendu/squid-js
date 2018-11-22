import * as assert from "assert"
import * as didTools from "../src/DID"

import * as Web3 from "web3"

describe("DID Tests", () => {

    describe("did generate", () => {

        it("should generate a valid DID", async () => {

            const testId = Web3.utils.randomHex(32) + "abcdefghijklmnopqrstuvwxyz"
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId

            const did = didTools.didGenerate(testId)
            assert(did)
            assert(did.match(/did:op:[a-h0-9]+/))
            assert(did === validDID)

        })
        it("should parse a valid DID", async () => {
            const testId = Web3.utils.randomHex(32) + "abcdefghijklmnopqrstuvwxyz"
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            const result = didTools.didParse(validDID + "/testpath#fragment")
            assert(result)
            assert(result.method === testMethod)
            assert(result.id === testId)
            assert(result.path === "/testpath")
            assert(result.fragment === "#fragment")
        })

        it("should parse a valid Ocean DID", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            const result = didTools.didParse(validDID + "/testpath#fragment")
            assert(result)
            assert(result.method === testMethod)
            assert(result.id === testId)
            assert(result.path === "/testpath")
            assert(result.fragment === "#fragment")
            assert(result.idHex === "0x" + testId)

        })

        it("should validate an Ocean DID", async () => {
            const testId = Web3.utils.randomHex(32).substring(2)
            const testMethod = "op"
            const validDID = "did:" + testMethod + ":" + testId
            assert(didTools.isDIDValid(validDID))
            assert(!didTools.isDIDValid(validDID + "abcdef"))
        })

    })

})
