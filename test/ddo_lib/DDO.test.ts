import {assert} from "chai"
import DDO from "../../src/libDDO/DDO"

import * as jsonDDO from "../testdata/ddoSample1.json"


describe("DDO", () => {

    describe("#constructor()", () => {

        it("should create an empty ddo", async () => {

            const ddo = new DDO()
            assert(ddo)
            assert(ddo.did == null)

        })
    })
    describe('JSON serialization unserialization', () => {
        it("should create ddo with the sample JSON", async () => {

            assert(jsonDDO)
            var ddo = new DDO(jsonDDO)
            assert(ddo)

            assert(ddo.validate())

            var jsonText = ddo.toJSON()
            assert(jsonText)
        })

    })
    describe('validation', () => {
        it("should test ddo core validation", async () => {

            // core ddo values
            assert(jsonDDO)
            var ddo = new DDO(jsonDDO)
            assert(ddo)

            assert(ddo.validate())
            ddo.did = ''
            assert(!ddo.validate())
        })
        it("should test ddo public key validation", async () => {

            // public key
            var ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.publicKeys[0].did = ''
            assert(!ddo.validate())

        })
        it("should test ddo authentication validation", async () => {

            // authentication
            var ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.authentications[0].type = ''
            assert(!ddo.validate())
        })
        it("should test ddo service validation", async () => {
            // service
            var ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.services[0].endpoint = ''
            assert(!ddo.validate())
        })
        it("should test ddo proof validation", async () => {
            // proof
            var ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            ddo.proof.signatureValue = ''
            assert(!ddo.validate())
        })
    })
    describe('DDO access data', () => {
        it("should find a service in the ddo", async () => {
            var ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            var service = ddo.getService('Metadata')
            assert(service)

            var service = ddo.getService('MetadataCannotFind')
            assert(service == null)
//            var item = ddo.findServiceKeyValue('serviceDefinitionId', 'test')
        })
    })
    describe('DDO hashing', () => {
        it("should hash a valid ddo", async () => {
            var ddo = new DDO(jsonDDO)
            assert(ddo)
            assert(ddo.validate())

            var hash = ddo.calculateHash()
            assert(hash)
            console.log(hash)

        })
    })

})
