import BigNumber from "bignumber.js"
import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import Config from "../../src/models/Config"
import DocumentKeys from "../../src/secretstore/DocumentKeys"
import ParityClient from "../../src/secretstore/ParityClient"

const parityUrl = "http://localhost:8545"

ConfigProvider.configure({
    nodeUri: parityUrl,
} as Config)

const address = "0xa50f397644973dba99624404b2894825840aa03b"
const password = "unittest"
const serverKey =
    "0x36131d552e561d8231cd91c8020d869e14c11b16e79fb80ecf8302ea0a0539c969dbc0b547398daf293c259431d7c483ee5974b0ef179297edbe6d39af4374d5"

const testDocument = {
    so: "secure",
    soWow: true,
}
const parityClient: ParityClient = new ParityClient({
    url: parityUrl,
    address, password,
})

function generateRandomId(): string {
    const id: string = BigNumber.random(64).toString().replace("0.", "")

    // sometimes it only generates 63 digits
    return id.length === 63 ? id + "0" : id
}

describe("ParityClient", () => {

    describe("#signKeyId()", () => {
        it("should generate sig from given key", async () => {

            const keyId = generateRandomId()
            const keyIdSig = await parityClient.signKeyId(keyId)

            assert(keyIdSig)
        })
    })

    describe("#generateDocumentKeyFromKey()", () => {
        it("should generate a document key from a server key", async () => {

            const documentKey = await parityClient.generateDocumentKeyFromKey(serverKey)
            assert(documentKey)
        })
    })

    describe("#encryptDocument()", () => {
        it("should encrypt an document", async () => {

            const documentKey: DocumentKeys = await parityClient.generateDocumentKeyFromKey(serverKey)
            const encryptedDocument = await parityClient.encryptDocument(documentKey.encryptedKey, testDocument)
            assert(encryptedDocument)
        })
    })

    describe("#decryptDocument()", () => {
        it("should decrypt an document", async () => {

            const documentKey: DocumentKeys = await parityClient.generateDocumentKeyFromKey(serverKey)
            const encryptedDocument = await parityClient.encryptDocument(documentKey.encryptedKey, testDocument)
            assert(encryptedDocument)
        })
    })
})
