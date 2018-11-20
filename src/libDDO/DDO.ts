
import Authentication from "./Authentication"
import Proof from "./Proof"
import PublicKey from "./PublicKey"
import Service from "./Service"

import * as Web3 from "web3"

//const crypto = require('crypto')

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

    public static validateSignature(text: string, keyValue: string, signature: string, authenticationType: string) {
        if ( authenticationType === Authentication.TYPE_RSA ) {
        }
        return true
    }
    
    public static CONTEXT: string = "https://w3id.org/future-method/v1"
    public context: string = DDO.CONTEXT
    public did: string
    public created: string
    public publicKeys: PublicKey[]
    public authentications: Authentication[]
    public services: Service[]
    public proof: Proof

    public constructor(did?: any) {
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

        this.publicKeys = []

        if ( data.hasOwnProperty("publicKey") ) {
            data.publicKey.forEach(function(value) {
                this.publicKeys.push(new PublicKey(value))
            }, this)
        }

        this.authentications = []
        if ( data.hasOwnProperty("authentication") ) {
            data.authentication.forEach(function(value) {
                this.authentications.push(new Authentication(value))
            }, this)
        }

        this.services = []
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
            if ( publicKey.did === keyId ) {
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
        console.log(publicKey)
        const keyValue = publicKey.decodeValue()
        console.log(keyValue)
        
        const authentication = this.getAuthentication(publicKey.did)
        
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
        const signature = new Buffer(this.proof.signatureValue, "base64")
        return this.validateFromKey(this.proof.creator, signatureText, signature.toString("ascii"))
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
