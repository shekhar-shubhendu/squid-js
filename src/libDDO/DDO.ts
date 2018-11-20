
import Authentication from "./Authentication"
import PublicKey from "./PublicKey"
import Service from "./Service"
import Proof from "./Proof"


import * as Web3 from "web3"

export default class DDO {

    public static CONTEXT: string = "https://w3id.org/future-method/v1"
    
/*
    public static serialize(ddo: DDO): string {
        return JSON.stringify(ddo, null, 2)
    }

    public static deserialize(ddoString: string): DDO {
        const ddo = JSON.parse(ddoString)

        return ddo as DDO
    }
*/

    public context: string = DDO.CONTEXT
    public did: string
    public created: string
    public publicKeys: PublicKey[]
    public authentications: Authentication[]
    public services: Service[]
    public proof: Proof

    public constructor(did?: any) {
        if (typeof did == 'string') {
            this.did = did
        }
        else if (typeof did == 'object') {
            this.readFromData(did)
        }
    }
    
    public readFromData(data: object) {
        this.did = data['id']
        var date = new Date()
        this.created = date.toISOString()
        if (data.hasOwnProperty('created')) {
            this.created = data['created']
        }
        
        this.context = DDO.CONTEXT
        if ( data.hasOwnProperty('@context') ) {
            this.context = data['@context']
        }
        
        this.publicKeys = []
        
        if ( data.hasOwnProperty('publicKey') ) {
            data['publicKey'].forEach(function(value) {
                this.publicKeys.push(new PublicKey(value))
            }, this)
        }

        this.authentications = []
        if ( data.hasOwnProperty('authentication') ) {
            data['authentication'].forEach(function(value) {
                this.authentications.push(new Authentication(value))
            }, this)
        }

        this.services = []
        if ( data.hasOwnProperty('service') ) {
            data['service'].forEach(function(value) {
                this.services.push(new Service(value))
            }, this)
        }
        
        if ( data.hasOwnProperty('proof') ) {
            this.proof = new Proof(data['proof'])
        }
    }
    
    public toData(): object {
        var data = {
            '@context': this.context,
            'id': this.did,
            'created': this.created
        }
        if ( this.publicKeys.length > 0 ) {
            data['publicKey'] = []
            this.publicKeys.forEach(function(publicKey) {
                this.push(publicKey.toData())
            }, data['publicKey'])
        }

        if ( this.authentications.length > 0 ) {
            data['authentication'] = []
            this.authentications.forEach(function(authentication) {
                this.push(authentication.toData())
            }, data['authentication'] )
        }
        
        if ( this.services.length > 0 ) {
            data['service'] = []
            this.services.forEach(function(service) {
                this.push(service.toData())
            }, data['service'])
        }
        
        if ( this.isProofDefined() ) {
            data['proof'] = this.proof.toData()
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
        
        if (this.context.length == 0 || this.did.length == 0 || this.created.length == 0) {
            return false
        }

        if ( this.publicKeys.length == 0 ) {
            return false
        }
        if ( this.authentications.length == 0 ) {
            return false
        }
        if ( this.services.length == 0 ) {
            return false
        }
        
        var result = { 'isValid': true }
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
        var result = { 'service': null }
        this.services.forEach(function(service) {
            if (service.type == serviceType ) {
                this.service = service
            }
        }, result)
        return result.service
    }
    
    public findServiceKeyValue(key: string, value: string): Service {
        var result = { 'service': null }
        this.services.forEach(function(service) {
            if (service.values[key] == value) {
                this.service = service
            }
        }, result)
        return result.service
    }
    
    // return a string list of fields used for hashing
    public hashTextList(): string[] {
        var values = []
        
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
        var values = this.hashTextList()
        return Web3.utils.sha3(values.join())
    }
    
    public isEmpty(): boolean {
        return this.did && this.did.length == 0 
                && this.publicKeys.length == 0
                && this.authentications.length == 0 
                && this.services.length == 0
    }
    
    public isDIDAssigned(): boolean {
        return this.did && this.did.length > 0
    }
}
