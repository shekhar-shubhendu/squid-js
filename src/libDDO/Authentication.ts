
import PublicKey from "./PublicKey"

interface IAuthentication {
    publicKey?: any
    type?: string
}

export default class Authentication {

    public static TYPE_RSA = "RsaVerificationKey2018"

    public publicKeyId?: string
    public publicKey?: PublicKey
    public type: string
    public value: string

    public constructor(data?: IAuthentication) {

        if (typeof data.publicKey === "string" ) {
            this.publicKeyId = data.publicKey
        } else {
            this.publicKey = new PublicKey(data.publicKey)
        }
        this.type = data.type
    }

    public toData(): IAuthentication {
        const data: IAuthentication = {
            type: this.type,
            publicKey: this.publicKeyId,
        }
        if ( data.publicKey == null && this.publicKey != null ) {
            data.publicKey = this.publicKey.toData()
        }
        return data
    }

    public isValid(): boolean {
        return this.publicKeyId && this.publicKeyId.length > 0 && this.type.length && this.type.length > 0
    }
}
