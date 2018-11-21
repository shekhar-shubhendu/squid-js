
interface IPublicKey {
    id?: string
    owner?: string
    type?: string
}

export default class PublicKey {

    public static TYPE_RSA: string = "RsaSignatureAuthentication2018"
    public static STORE_TYPES = {
        PEM: "publicKeyPem",
        JWK: "publicKeyJwk",
        HEX: "publicKeyHex",
        BASE64: "publicKeyBase64",
        BASE85:  "publicKeyBase85",
    }

    public id: string
    public owner: string
    public type: string
    public storeType: string
    public value: string

    public constructor(data?: any) {
        this.id = data.id
        this.owner = data.owner
        this.type = data.type
        if ( data.hasOwnProperty("storeType") ) {
            this.storeType = data.storeType
        }
        if ( data.hasOwnProperty("value") ) {
            this.value = data.value
        }
        if ( data ) {
            this._readValue(data)
        }
    }

    public toData(): IPublicKey {
        return {
            id: this.id,
            owner: this.owner,
            type: this.type,
            [this.storeType]: this.value,
        } as IPublicKey
    }

    public isValid(): boolean {
        return this.id && this.id.length > 0
            && this.owner && this.owner.length > 0
            && this.type && this.type.length > 0
            && this.value && this.value.length > 0
    }

    public decodeValue(): string {
        let value = this.value
        let buffer = null
        switch (this.storeType) {
            case PublicKey.STORE_TYPES.PEM:
                value = this.value
                break
            case PublicKey.STORE_TYPES.JWK:
                // TODO: implement
                break
            case PublicKey.STORE_TYPES.HEX:
                buffer = Buffer.from(this.value, "hex")
                value = buffer.toString("binary")
                break
            case PublicKey.STORE_TYPES.BASE64:
                buffer = Buffer.from(this.value, "base64")
                value = buffer.toString("binary")
                break
            case PublicKey.STORE_TYPES.BASE85:
                buffer = Buffer.from(this.value, "base85")
                value = buffer.toString("binary")
                break
        }
        return value
    }

    private _readValue(data: IPublicKey) {
        for ( const key in PublicKey.STORE_TYPES) {
            if ( PublicKey.STORE_TYPES.hasOwnProperty(key) ) {
                const storeType = PublicKey.STORE_TYPES[key]
                if (data.hasOwnProperty(storeType) ) {
                    this.storeType = storeType
                    this.value = data[storeType]
                }
            }
        }
    }

}
