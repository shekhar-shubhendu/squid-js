
interface IPublicKey {
    id?: string
    owner?: string
    type?: string
}

export default class PublicKey {

    public static TYPE_RSA: string = "RsaSignatureAuthentication2018"
    public static PEM: string = "publicKeyPem"
    public static JWK: string = "publicKeyJwk"
    public static HEX: string = "publicKeyHex"
    public static BASE64: string = "publicKeyBase64"
    public static BASE85: string = "publicKeyBase85"

    public did: string
    public owner: string
    public type: string
    public value: string

    public constructor(data?: IPublicKey) {
        this.did = data.id
        this.owner = data.owner
        this.type = data.type
        this.value = data[PublicKey.PEM]
    }

    public toData(): IPublicKey {
        return {
            id: this.did,
            owner: this.owner,
            type: this.type,
            [PublicKey.PEM]: this.value,
        } as IPublicKey
    }

    public isValid(): boolean {
        return this.did && this.did.length > 0
            && this.owner && this.owner.length > 0
            && this.type && this.type.length > 0
            && this.value && this.value.length > 0
    }

}
