// import PublicKey from "./PublicKey"


export default class Authentication {


//    private publicKey?: PublicKey
    public publicKeyId: string
    public type: string
    public value: string
    
    public constructor(data?: any) {
        this.publicKeyId = data['publicKey']
        this.type = data['type']
        this.value = ''
    }
    
    public toData(): object {
        return {
            'publicKey': this.publicKeyId,
            'type': this.type
        }
    }
    public isValid(): boolean {
        return this.publicKeyId != '' && this.type != ''
    }
    
}

