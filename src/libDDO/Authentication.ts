
interface IAuthentication {
    publicKey?: string
    type?: string
}

export default class Authentication {

    public publicKeyId: string
    public type: string
    public value: string

    public constructor(data?: IAuthentication) {
        this.publicKeyId = data.publicKey
        this.type = data.type
        this.value = ""
    }

    public toData(): IAuthentication {
        return {
            publicKey: this.publicKeyId,
            type: this.type,
        } as IAuthentication
    }

    public isValid(): boolean {
        return this.publicKeyId && this.publicKeyId.length > 0 && this.type.length && this.type.length > 0
    }
}
