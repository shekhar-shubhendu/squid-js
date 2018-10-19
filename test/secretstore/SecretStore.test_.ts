import BigNumber from "bignumber.js"
import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import Config from "../../src/models/Config"
import SecretStore from "../../src/secretstore/SecretStore"

const parityUrl = "http://localhost:8545"
const ssUrl = "https://secret-store.dev-ocean.com"

ConfigProvider.configure({
    nodeUri: ssUrl,
} as Config)

const address = "0xa50f397644973dba99624404b2894825840aa03b"
const password = "unittest"

const secretStore: SecretStore = new SecretStore({
    secretStoreUrl: ssUrl, parityUrl,
    address,
    password,
})

function generateRandomId(): string {
    const id: string = BigNumber.random(64).toString().replace("0.", "")

    // sometimes it only generates 63 digits
    return id.length === 63 ? id + "0" : id
}

describe("SecretStore", () => {

    describe("#generateServerKey()", () => {
        it("should generate Server key", async () => {

            const serverKeyId = generateRandomId()
            const serverKey = await secretStore.generateServerKey(serverKeyId)

            assert(serverKey)
        })
    })

    describe("#storeDocumentKey()", () => {
        it("should store Document key", async () => {

            const serverKeyId = generateRandomId()
            const documentKeyId = generateRandomId()
            const documentKey = await secretStore.storeDocumentKey(serverKeyId, documentKeyId)

            assert(documentKey)
        })
    })
})
