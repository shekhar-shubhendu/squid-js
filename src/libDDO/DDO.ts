
import Authentication from "./Authentication"
import Proof from "./Proof"
import PublicKey from "./PublicKey"
import Service from "./Service"

import * as ursa from "ursa"
import * as Web3 from "web3"

interface IDDO {
    id: string
    created?: string
    ["@context"]: string
    publicKey?: []
    authentication?: []
    service?: []
    proof?: {}
}

export default class DDO {

    public static CONTEXT: string = "https://w3id.org/future-method/v1"

    public static validateSignature(text: string, keyValue: string, signature: string, authenticationType: string) {
        if ( authenticationType === Authentication.TYPE_RSA ) {
            const key = ursa.createPublicKey(keyValue, "utf8")
            const buffer = new Buffer(text, "utf8")

//            console.log("valid", signature.length, Web3.utils.sha3(text + signature))
            return key.hashAndVerify("sha256", buffer.toString("base64"), signature, "base64")
        }
        return false
    }

    public static signText(text: string, keyValue: string, signType: string): string {
        const signature = ""
        if ( signType === PublicKey.TYPE_RSA ) {
            const key = ursa.createPrivateKey(keyValue)
//            console.log("privkey", keyValue, key.toPrivatePem("utf8"))
            signature = key.hashAndSign("sha256", text, "utf8", "base64")
//            console.log("sign", signature.length, Web3.utils.sha3(text + signature))
        }
        return signature
    }

    public context: string = DDO.CONTEXT
    public did: string
    public created: string
    public publicKeys: PublicKey[]
    public authentications: Authentication[]
    public services: Service[]
    public proof: Proof

    public constructor(did?: any) {
        this.publicKeys = []
        this.authentications = []
        this.services = []

        if (typeof did === "string") {
            this.did = did
        }
        if (typeof did === "object") {
            this.readFromData(did)
        }

    }

    public readFromData(data: IDDO) {
        if (data.hasOwnProperty("id") ) {
            this.did = data.id
        }
        const date = new Date()
        this.created = date.toISOString()
        if (data.hasOwnProperty("created")) {
            this.created = data.created
        }

        this.context = DDO.CONTEXT
        if ( data.hasOwnProperty("@context") ) {
            this.context = data["@context"]
        }

        if ( data.hasOwnProperty("publicKey") ) {
            data.publicKey.forEach(function(value) {
                this.publicKeys.push(new PublicKey(value))
            }, this)
        }

        if ( data.hasOwnProperty("authentication") ) {
            data.authentication.forEach(function(value) {
                this.authentications.push(new Authentication(value))
            }, this)
        }

        if ( data.hasOwnProperty("service") ) {
            data.service.forEach(function(value) {
                this.services.push(new Service(value))
            }, this)
        }

        if ( data.hasOwnProperty("proof") ) {
            this.proof = new Proof(data.proof)
        }
    }

    public toData(): IDDO {
        const data: IDDO = {
            "@context": this.context,
            "id": this.did,
            "created": this.created,
        }
        if ( this.publicKeys.length > 0 ) {
            data.publicKey = []
            this.publicKeys.forEach(function(publicKey) {
                this.push(publicKey.toData())
            }, data.publicKey)
        }

        if ( this.authentications.length > 0 ) {
            data.authentication = []
            this.authentications.forEach(function(authentication) {
                this.push(authentication.toData())
            }, data.authentication )
        }

        if ( this.services.length > 0 ) {
            data.service = []
            this.services.forEach(function(service) {
                this.push(service.toData())
            }, data.service)
        }

        if ( this.isProofDefined() ) {
            data.proof = this.proof.toData()
        }
        return data
    }

    public toJSON(): string {
        return JSON.stringify(this.toData(), null, 2)
    }

    public addSignature(keyType?: string): string {
        if ( keyType == null ) {
            keyType = PublicKey.PEM
        }
        if (keyType === PublicKey.PEM ) {
            // generate the key pairs
            const keys = ursa.generatePrivateKey(1024, 65537)

            // add a public key record
            const nextIndex = this.publicKeys.length + 1
            const keyId = (this.did ? this.did : "" )  + "#keys=" + nextIndex
            const publicKey = new PublicKey({id: keyId, owner: keyId, type: PublicKey.TYPE_RSA})
            publicKey.value =  keys.toPublicPem("utf8")
            this.publicKeys.push(publicKey)

            // add an authentication record
            const authentication = new Authentication({ publicKey: publicKey.id, type: Authentication.TYPE_RSA})
            this.authentications.push(authentication)
            return keys.toPrivatePem("utf8")
        }
        return null
    }

    public addService(data): Service {
        const service = new Service(data)
        if (service.id == null ) {
            service.id = this.did
        }
        this.services.push(service)
        return service
    }

    public addProof(authIndex, privateKey, signatureText?) {
        if ( authIndex == null ) {
            authIndex = 0
        }
        const authentication = this.authentications[authIndex]
        // get the public key stored for this authentication
        const publicKey = this.getPublicKey(authentication.publicKeyId)

        if ( signatureText == null ) {
            signatureText = this.hashTextList().join()
        }
        const signature = DDO.signText(signatureText, privateKey, publicKey.type)
//        const signatureBuffer = new Buffer(signature, 'utf8')
        const date = new Date()

        this.proof = new Proof({
            created: date.toISOString(),
            creator: publicKey.id,
            type: publicKey.type,
//            signatureValue: signatureBuffer.toString("base64"),
            signatureValue: signature,
        })
    }

    public isProofDefined(): boolean {
        return this.proof != null
    }
    public validate(): boolean {

        if (this.context.length === 0 || this.did.length === 0 || this.created.length === 0) {
            return false
        }

        if ( this.publicKeys.length === 0 ) {
            return false
        }
        if ( this.authentications.length === 0 ) {
            return false
        }
        if ( this.services.length === 0 ) {
            return false
        }

        const result = { isValid: true }
        this.publicKeys.forEach(function(publicKey) {
            if ( !publicKey.isValid() ) {
                this.isValid = false
            }
        }, result)
        if ( ! result.isValid ) {
            return false
        }

        this.authentications.forEach(function(authentication) {
            if ( !authentication.isValid() ) {
                this.isValid = false
            }
        }, result)
        if ( ! result.isValid ) {
            return false
        }

        this.services.forEach(function(service) {
            if ( !service.isValid() ) {
                this.isValid = false
            }
        }, result)
        if ( ! result.isValid ) {
            return false
        }

        if ( this.isProofDefined() ) {
            if ( !this.proof.isValid() ) {
                return false
            }
        }
        return true
    }
    // return a service based on the service type value
    public getService(serviceType: string): Service {
        const result = { service: null }
        this.services.forEach(function(service) {
            if (service.type === serviceType ) {
                this.service = service
            }
        }, result)
        return result.service
    }

    public findServiceKeyValue(key: string, value: string): Service {
        const result = { service: null }
        this.services.forEach(function(service) {
            if (service.values[key] === value) {
                this.service = service
            }
        }, result)
        return result.service
    }

    // return a string list of fields used for hashing
    public hashTextList(): string[] {
        const values = []

        if (this.created) {
            values.push(this.created)
        }

        this.publicKeys.forEach(function(publicKey) {
            this.push(publicKey.type)
            this.push(publicKey.value)
        }, values)

        this.authentications.forEach(function(authentication) {
            this.push(authentication.type)
            this.push(authentication.value)
        }, values)

        this.services.forEach(function(service) {
            this.push(service.type)
            this.push(service.endpoint)
        }, values)
        return values
    }

    public calculateHash(): string {
        const values = this.hashTextList()
        return Web3.utils.sha3(values.join())
    }

    public getPublicKey(keyId: string): PublicKey {
        const result = {publicKey: null }
        this.publicKeys.forEach(function(publicKey) {
            if ( publicKey.id === keyId ) {
                this.publicKey = publicKey
            }
        }, result)
        return result.publicKey
    }

    public getAuthentication(publicKeyId: string): Authentication {
        const result = {authentication: null }
        this.authentications.forEach(function(authentication) {
            if ( authentication.publicKeyId === publicKeyId ) {
                this.authentication = authentication
            }
        }, result)
        return result.authentication
    }

    public validateFromKey(keyId: string, signatureText: string, signatureValue: string): boolean {
        const publicKey = this.getPublicKey(keyId)
        if ( ! publicKey) {
            return false
        }
        const keyValue = publicKey.decodeValue()
        const authentication = this.getAuthentication(publicKey.id)

        return DDO.validateSignature(signatureText, keyValue, signatureValue, authentication.type)
    }

    public validateProof(signatureText?: string): boolean {
        if ( signatureText == null ) {
            signatureText = this.hashTextList().join()
        }
        if ( !this.isProofDefined() ) {
            return false
        }
        if ( !this.proof.isValid() ) {
            return false
        }
//        const signature = new Buffer(this.proof.signatureValue, "base64")
//        return this.validateFromKey(this.proof.creator, signatureText, signature.toString("utf8"))
        return this.validateFromKey(this.proof.creator, signatureText, this.proof.signatureValue)
    }

    public isEmpty(): boolean {
        return this.did && this.did.length === 0
                && this.publicKeys.length === 0
                && this.authentications.length === 0
                && this.services.length === 0
    }

    public isDIDAssigned(): boolean {
        return this.did && this.did.length > 0
    }
}
