
interface IPublicKey {
    id?: string
    owner?: string
    type?: string
}

export default class PublicKey {

    public static TYPE_RSA: string = "RsaSignatureAuthentication2018"
    public static STORE_AS_PEM: string = "publicKeyPem"
    public static STORE_AS_JWK: string = "publicKeyJwk"
    public static STORE_AS_HEX: string = "publicKeyHex"
    public static STORE_AS_BASE64: string = "publicKeyBase64"
    public static STORE_AS_BASE85: string = "publicKeyBase85"

    public id: string
    public owner: string
    public type: string
    public value: string

    public constructor(data?: IPublicKey) {
        this.id = data.id
        this.owner = data.owner
        this.type = data.type
        this.value = data[PublicKey.STORE_AS_PEM]
    }

    public toData(): IPublicKey {
        return {
            id: this.id,
            owner: this.owner,
            type: this.type,
            [PublicKey.STORE_AS_PEM]: this.value,
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
        switch (this.type) {
            case PublicKey.STORE_AS_PEM:
                value = this.value
                break
            case PublicKey.STORE_AS_JWK:
                // TODO: implement
                break
            case PublicKey.STORE_AS_HEX:
                buffer = Buffer.from(this.value, "hex")
                value = buffer.toString("binary")
                break
            case PublicKey.STORE_AS_BASE64:
                buffer = Buffer.from(this.value, "base64")
                value = buffer.toString("binary")
                break
            case PublicKey.STORE_AS_BASE85:
                buffer = Buffer.from(this.value, "base85")
                value = buffer.toString("binary")
                break
        }
        return value
    }
}
