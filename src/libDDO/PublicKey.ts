export default class PublicKey {
    
    public static TYPE_RSA: string = 'RsaSignatureAuthentication2018'
    public static PEM: string = 'publicKeyPem'
    public static JWK: string = 'publicKeyJwk'
    public static HEX: string = 'publicKeyHex'
    public static BASE64: string = 'publicKeyBase64'
    public static BASE85: string = 'publicKeyBase85'
    
    public did: string
    public owner: string
    public type: string
    public value: string

    public constructor(data?: any) {
        this.did = data['id']
        this.owner = data['owner']
        this.type = data['type']
        this.value = data[PublicKey.PEM]
    }
    
    public toData(): object {
        return {
            'id': this.did,
            'owner': this.owner,
            'type': this.type,
            [PublicKey.PEM]: this.value
        }
    }
    
    public isValid(): boolean {
        return this.did != '' && this.owner != '' && this.type != '' && this.value != ''
    }

}

