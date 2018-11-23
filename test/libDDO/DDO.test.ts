import {assert} from "chai"
import DDO from "../../src/libDDO/DDO"
import IdGenerator from "../../src/ocean/IdGenerator"

import * as jsonDDO from "../testdata/ddoSample1.json"

describe("libDDO", () => {

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
            for( let i = 0; i < 5; i ++ ) {
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
            const service = ddo.addService({type: "metatrippy", serviceEndpoint: "http://localhost:5000"})
            assert(service)
            assert(service.id === did)
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

})
