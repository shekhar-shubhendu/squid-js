import {assert} from "chai"
import SecretStore from "../../src/secretstore/SecretStore"

describe("SecretStore", () => {

    describe("#test()", () => {
        it("should return instance", () => {

            const fu = new SecretStore().test()
            assert(fu)
        })
    })
})
