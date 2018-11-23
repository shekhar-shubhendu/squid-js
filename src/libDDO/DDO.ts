/*
 *
 * DDO Library to parse, create and validate DDO JSON data
 *
 */

import Authentication from "./Authentication"
import Proof from "./Proof"
import PublicKey from "./PublicKey"
import Service from "./Service"

import * as ursa from "ursa-optional"
import * as Web3 from "web3"

interface IDDO {
    id: string
    created?: string
    ["@context"]: string
    publicKey?: any[]
    authentication?: any[]
    service?: any[]
    proof?: any
}

export default class DDO {

    public static CONTEXT: string = "https://w3id.org/did/v1"
    public static ENCODING_TYPES = {
        PEM: "pem",
        HEX: "hex",
        BASE64: "base64",
    }

    /*
     * Function to validate a signed text using the public key
     *
     * :param text: text string to hash to create the signature on
     * :param keyValue: public key of the signer
     * :param encoding: encoding of the public key, can be 'utf8', 'hex'
     * :param signature: binary value of the signature that was created by the
     * users private key
     * :param authenticationType: Type of authentication, at the moment it's "RsaVerificationKey2018"
     *
     * :return true if the signature was valid with the text
     */
    public static validateSignature(
        text: string,
        keyValue: string,
        encoding: string,
        signature: string,
        authenticationType: string) {

        if ( authenticationType === Authentication.TYPE_RSA ) {
            const publicKeyValue = ursa.createPublicKey(keyValue, encoding)
//            console.log("valid", signature.length, Web3.utils.sha3(text + signature))
            return publicKeyValue.hashAndVerify("sha256", text, signature, "binary")
        }
        return false
    }

    /*
     * Function to sign a some text using the private key
     *
     * :param text: text to sign
     * :param keyValue: private key in PEM format
     * :param signType: at the moment only "RsaSignatureAuthentication2018" is supported
     *
     * :return signature in binary format
     *
     */
    public static signText(text: string, keyValue: string, signType: string): string {
        let signature = ""
        if ( signType === PublicKey.TYPE_RSA ) {
            const key = ursa.createPrivateKey(keyValue)
            signature = key.hashAndSign("sha256", text, "binary", "binary")
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

    /*
     * Read from a data structur, this can be a JSON
     * :param data: data to import
     */
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
        this.authentications = []
        this.services = []

        if ( data.hasOwnProperty("publicKey") ) {
            for (const value of data.publicKey) {
                this.publicKeys.push(new PublicKey(value))
            }
        }

        if ( data.hasOwnProperty("authentication") ) {
            for (const value of data.authentication) {
                this.authentications.push(new Authentication(value))
            }
        }

        if ( data.hasOwnProperty("service") ) {
            for (const value of data.service) {
                this.services.push(new Service(value))
            }
        }

        if ( data.hasOwnProperty("proof") ) {
            this.proof = new Proof(data.proof)
        }
    }

    /*
     * Convert the current DDO into a data sturcture
     * :return data values of the DDO
     */
    public toData(): IDDO {
        const data: IDDO = {
            "@context": this.context,
            "id": this.did,
            "created": this.created,
        }
        if ( this.publicKeys.length > 0 ) {
            data.publicKey = []
            for ( const publicKey of this.publicKeys ) {
                data.publicKey.push(publicKey.toData())
            }
        }

        if ( this.authentications.length > 0 ) {
            data.authentication = []
            for ( const authentication of this.authentications) {
                data.authentication.push(authentication.toData())
            }
        }

        if ( this.services.length > 0 ) {
            data.service = []
            for ( const service of this.services ) {
                data.service.push(service.toData())
            }
        }

        if ( this.isProofDefined() ) {
            data.proof = this.proof.toData()
        }
        return data
    }

    /*
     * return a JSON string of the DDO data
     */
    public toJSON(): string {
        return JSON.stringify(this.toData(), null, 2)
    }

    /*
     * Add a signature to the DDO
     *
     * :param encoding: optional type of encoding of the public key 'hex', 'pem'. Defaults to 'pem'
     * :param isEmbedded: optional if set to true then embedd the public key in
     * the authorization record
     * :return the private key used to sign in 'pem' format
     *
     */
    public addSignature(encoding?: string, isEmbedded?: boolean): string {
        encoding = encoding ? encoding : DDO.ENCODING_TYPES.PEM
        isEmbedded = isEmbedded ? isEmbedded : false

        encoding = encoding.toLowerCase()
        // generate the key pairs
        const keys = ursa.generatePrivateKey(1024, 65537)

        // add a public key record
        const nextIndex = this.publicKeys.length + 1
        const keyId = (this.did ? this.did : "" )  + "#keys=" + nextIndex
        const publicKeyObj = new PublicKey({id: keyId, owner: keyId, type: PublicKey.TYPE_RSA})
        switch ( encoding ) {
            case DDO.ENCODING_TYPES.PEM:
                publicKeyObj.value =  keys.toPublicPem("utf8")
                publicKeyObj.storeType = PublicKey.STORE_TYPES.PEM
                break
            case DDO.ENCODING_TYPES.HEX:
                publicKeyObj.value =  keys.toPublicPem("hex")
                publicKeyObj.storeType = PublicKey.STORE_TYPES.HEX
                break
            case DDO.ENCODING_TYPES.BASE64:
                publicKeyObj.value =  keys.toPublicPem("base64")
                publicKeyObj.storeType = PublicKey.STORE_TYPES.BASE64
                break
        }
        if ( isEmbedded ) {
            const authentication = new Authentication({ publicKey: publicKeyObj, type: Authentication.TYPE_RSA})
            this.authentications.push(authentication)
        } else {
            // add the public key
            this.publicKeys.push(publicKeyObj)

            // add an authentication record
            const authentication = new Authentication({ publicKey: publicKeyObj.id, type: Authentication.TYPE_RSA})
            this.authentications.push(authentication)
        }
        return keys.toPrivatePem("utf8")
    }

    /*
     * Add a service to the DDO
     *
     * :param data: data of the service record
     *
     * :return The Service object
     */
    public addService(data): Service {
        const service = new Service(data)
        if (service.id == null ) {
            service.id = this.did
        }
        this.services.push(service)
        return service
    }

    /*
     * Add proof to the DDO
     *
     * :param authIndex: index of the authorization record
     * :param privateKey: PEM of the private key
     * :param signatureText: optional signature text, if none provided
     * then the 'this.hashTextList()' will be called to get the standard
     * hash text
     *
     */
    public addProof(privateKey: string, authIndex?: number, signatureText?: string) {
        authIndex = authIndex ? authIndex : 0
        const authentication = this.authentications[authIndex]

        let publicKey = null
        if ( authentication.publicKey ) {
            publicKey = authentication.publicKey
        } else {
            // get the public key stored for this authentication
            publicKey = this.getPublicKey(authentication.publicKeyId)
        }

        if ( signatureText == null ) {
            signatureText = this.hashTextList().join()
        }
        const signature = DDO.signText(signatureText, privateKey, publicKey.type)
        const signatureBuffer = Buffer.from(signature, "binary")
        const date = new Date()

        this.proof = new Proof({
            created: date.toISOString(),
            creator: publicKey.id,
            type: publicKey.type,
            signatureValue: signatureBuffer.toString("base64"),
        })
    }

    /*
     * return: true if a static has been defined in DDO
     */
    public isProofDefined(): boolean {
        return this.proof != null
    }

    /*
     * Validate the DDO for the correct data and fields, if a static
     * proof is defined, then also validate the static proof
     *
     * :return true if this DDO is valid
     */
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

        for ( const publicKey of this.publicKeys) {
            if ( !publicKey.isValid() ) {
                return false
            }
        }
        for ( const authentication of this.authentications) {
            if ( !authentication.isValid() ) {
                return false
            }
        }
        for ( const service of this.services) {
            if ( !service.isValid() ) {
                return false
            }
        }

        if ( this.isProofDefined() ) {
            if ( !this.proof.isValid() ) {
                return false
            }
        }
        return true
    }
    /*
     * :param serviceType: service.type to find in the DDO
     *
     * :return a valid service object if found, else null
     */
    public getService(serviceType: string): Service {
        for ( const service of this.services) {
            if (service.type === serviceType ) {
                return service
            }
        }
        return null
    }

    /*
     * Find a service based on it's key value
     *
     * e.g.
     *      service.ServiceAgreement = "test"
     * so calling
     *  this function with:
     *
     *  findServiceKeyValue("ServiceAgreement", "test")
     *
     * :param key: The key to search for
     * :param value: the key value to match
     *
     * :return a service object if found else return null
     */
    public findServiceKeyValue(key: string, value: string): Service {
        for ( const service of this.services) {
            if (service.values[key] === value) {
                return service
            }
        }
        return null
    }

    /*
     * Generate a list of strings for hashing
     * This is used as the default hash data for signing static proofs
     *
     * :return a string list
     */
    public hashTextList(): string[] {
        const values = []

        if (this.created) {
            values.push(this.created)
        }

        for ( const publicKey of this.publicKeys) {
            values.push(publicKey.type)
            values.push(publicKey.value)
        }

        for ( const authentication of this.authentications) {
            values.push(authentication.type)
            values.push(authentication.value)
        }

        for ( const service of this.services) {
            values.push(service.type)
            values.push(service.endpoint)
        }

        return values
    }

    /*
     * Calculate the hash of this DDO
     * :return a string hash
     */
    public calculateHash(): string {
        const values = this.hashTextList()
        return Web3.utils.sha3(values.join())
    }

    /*
     * Get a public key in this DDO
     *
     * :param keyId: public key id to find
     * :return the PublicKey object or null for not found
     */
    public getPublicKey(keyId: any): PublicKey {
        if ( typeof keyId === "number" ) {
            return this.publicKeys[keyId]
        }
        for ( const publicKey of this.publicKeys ) {
            if ( publicKey.id === keyId ) {
                return publicKey
            }
        }
        return null
    }

    /* Get an authentication object based on it's public key id
     *
     * This method will search the list of public keys in the DDO and
     * also the embedded public keys in the authentication records
     *
     * :param publicKeyId: the public key id to use to search
     * :return if found return the Authentication object or null
     */

    public getAuthentication(publicKeyId: string): Authentication {
        for ( const authentication of this.authentications ) {
            if ( authentication.publicKeyId === publicKeyId ) {
                return authentication
            }
            if ( authentication.publicKey && authentication.publicKey.id === publicKeyId ) {
                return authentication
            }
        }
        return null
    }

    /*
     * Validate a signature using a specified public key id. The public
     * key id can be from the list of public keys, or embedded in an authorization record
     *
     * :param keyId: The public key to validate the signature with
     * :param signatureText: optional text to use to validate the signature text, if
     * none provided then use the stand hashTextList
     * :param signatureValue: the singnature in binary format to validate against
     *
     * :return true if the signature, signatureText and keyId are all valid and have been
     * signed
     *
     */
    public validateFromKey(keyId: string, signatureText: string, signatureValue: string): boolean {
        let publicKey = this.getPublicKey(keyId)
        let authentication = null
        if ( publicKey) {
            authentication = this.getAuthentication(publicKey.id)
        } else {
            authentication = this.getAuthentication(keyId)
            if ( authentication ) {
                publicKey = authentication.publicKey
            }
        }
        if ( authentication == null ) {
            return false
        }

        let keyEncoding = "utf8"
        switch ( publicKey.storeType ) {
            case PublicKey.STORE_TYPES.PEM:
                keyEncoding = "utf8"
                break
            case PublicKey.STORE_TYPES.HEX:
                keyEncoding = "hex"
                break
            case PublicKey.STORE_TYPES.BASE64:
                keyEncoding = "base64"
                break
        }

        return DDO.validateSignature(signatureText,
            publicKey.value,
            keyEncoding,
            signatureValue,
            authentication.type,
        )
    }

    /*
     * Validate a static proof
     *
     * :param signatureText: text to validate the proof against, if not
     * provided then the 'hashTextList' will be used.
     *
     * :return true if the proof is valid
     *
     */
    public validateProof(signatureText?: string): boolean {
        signatureText = signatureText ? signatureText : this.hashTextList().join()

        if ( !this.isProofDefined() ) {
            return false
        }
        if ( !this.proof.isValid() ) {
            return false
        }
        const signature = Buffer.from(this.proof.signatureValue, "base64")
        return this.validateFromKey(this.proof.creator, signatureText, signature.toString("binary"))
    }

    /*
     * :return true if this DDO object is empty
     */
    public isEmpty(): boolean {
        return this.did && this.did.length === 0
                && this.publicKeys.length === 0
                && this.authentications.length === 0
                && this.services.length === 0
    }

    /*
     * :return true if a DID has been assigned to this DDO
     */
    public isDIDAssigned(): boolean {
        return this.did && this.did.length > 0
    }
}
