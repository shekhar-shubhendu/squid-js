import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import DDO from "../../src/libDDO/DDO"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import config from "../config"
import TestContractHandler from "../keeper/TestContractHandler"

import PublicKey from "../../src/libDDO/PublicKey"
import * as jsonDDO from "../testdata/ddoSample1.json"

let ocean: Ocean

describe("libDDO", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await TestContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
    })

    describe("#constructor()", () => {

        it("should create an empty ddo", async () => {

            const ddo = new DDO()
            assert(ddo)
            assert(ddo.did == null)

        })
    })
    describe("JSON serialization unserialization", () => {
        it("should create ddo with the sample JSON", async () => {

            assert(jsonDDO)
            const ddo = new DDO(jsonDDO)
            assert(ddo)

            assert(ddo.validate())

            const jsonText = ddo.toJSON()
            assert(jsonText)
        })

    })
    describe("validation", () => {
        it("should test ddo core validation", async () => {

            // core ddo values
            assert(jsonDDO)
            const ddo = new DDO(jsonDDO)
            assert(ddo)

            assert(ddo.validate())
            ddo.did = ""
            assert(!ddo.validate())
        })
        it("should test ddo public key validation", async () => {

            // public key
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.publicKeys[0].id = ""
            assert(!ddo.validate())

        })
        it("should test ddo authentication validation", async () => {

            // authentication
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.authentications[0].type = ""
            assert(!ddo.validate())
        })
        it("should test ddo service validation", async () => {
            // service
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.services[0].endpoint = ""
            assert(!ddo.validate())
        })
        it("should test ddo proof validation", async () => {
            // proof
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.proof.signatureValue = ""
            assert(!ddo.validate())
        })
    })
    describe("DDO access data", () => {
        it("should find the correct public key", async () => {
            const did = "did:op:" + IdGenerator.generateId()
            const ddo = new DDO(did)
            assert(ddo)
            for ( let i = 0; i < 5; i ++ ) {
                const privateKey = ddo.addSignature()
                assert(privateKey)
            }
            const publicKey = ddo.getPublicKey(4)
            assert(publicKey)

            const publicKeyId = ddo.getPublicKey(did + "#keys=5")
            assert(publicKeyId)
            assert(publicKeyId.id === publicKey.id)
        })

        it("should find a service in the ddo", async () => {
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            const serviceFound = ddo.getService("Metadata")
            assert(serviceFound)

            const serviceNotFound = ddo.getService("MetadataCannotFind")
            assert(serviceNotFound == null)

//            var item = ddo.findServiceKeyValue("serviceDefinitionId", "test")
        })
    })
    describe("DDO hashing", () => {
        it("should hash a valid ddo", async () => {
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            const hash = ddo.calculateHash()
            assert(hash)
//            console.log(hash)

        })
    })

    describe("DDO validate proof from JSON", () => {
        it("should have a valid ddo proof", async () => {
            const ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())
            ddo.validateProof()
        })
    })

    describe("DDO creation", () => {
        it("should add a signature", async () => {
            const ddo = new DDO()
            assert(ddo)
            const privateKey = ddo.addSignature()
            assert(privateKey.match("-----BEGIN RSA PRIVATE KEY-----"))
        })

        it("should add a service", async () => {
            const did = "did:op:" + IdGenerator.generateId()
            const ddo = new DDO(did)
            assert(ddo)
            const testServiceType = "metatrippy"
            const testServiceURL = "http://localhost:5555"
            const service = ddo.addService({
                type: testServiceType,
                serviceEndpoint: testServiceURL,
            })
            assert(service)
            assert(service.id === did)
            assert(service.type === testServiceType )
            assert(service.endpoint === testServiceURL )
        })
        it("should add a static proof and validate", async () => {
            const did = "did:op:" + IdGenerator.generateId()
            const ddo = new DDO(did)
            assert(ddo)
            const privateKey = ddo.addSignature()
            assert(privateKey.match("-----BEGIN RSA PRIVATE KEY-----"))
            ddo.addProof(privateKey)
//            console.log(ddo.toJSON())
            assert(ddo.validateProof())
        })

        it("should add a static embedded proof and validate", async () => {
            const did = "did:op:" + IdGenerator.generateId()
            const ddo = new DDO(did)
            assert(ddo)
            const privateKey = ddo.addSignature("pem", true)
            assert(privateKey.match("-----BEGIN RSA PRIVATE KEY-----"))
            ddo.addProof(privateKey)
//            console.log(ddo.toJSON())
            assert(ddo.validateProof())
        })
    })

    describe("DDO signing", () => {
        it("should add an Ethereum account public key", async () => {

            const ownerAccount: Account = (await ocean.getAccounts())[0]
            assert(ownerAccount)

            const did = "did:op:" + IdGenerator.generateId()
            const ddo = new DDO(did)
            assert(ddo)
            // add the public key
            const publicKey = ddo.addPublicKey({
                value: await ownerAccount.getPublicKey(),
                storeType: "hex",
                owner: ownerAccount.getId(),
            })

            // add the authentication record
            const authentication = ddo.addAuthentication({ publicKey: publicKey.id })

            assert(publicKey.id === authentication.publicKeyId)
            assert(publicKey.owner === ownerAccount.getId())
            assert(publicKey.type === PublicKey.TYPE_RSA)
            const data: any = publicKey.toData()
            assert(data.hex === publicKey.value)
        })
    })

})
