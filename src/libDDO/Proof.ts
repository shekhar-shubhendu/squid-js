interface IProof {
    created?: string
    creator?: string
    type?: string
    signatureValue?: string
}

export default class Proof {

    public created: string
    public creator: string
    public type: string
    public signatureValue: string

    public constructor(data?: IProof) {
        this.created = data.created
        this.creator = data.creator
        this.type = data.type
        this.signatureValue = data.signatureValue
    }

    public toData(): IProof {
        return {
            created: this.created,
            creator: this.creator,
            type: this.type,
            signatureValue: this.signatureValue,
        } as IProof
    }

    public isValid(): boolean {
        return this.created && this.created.length > 0
            && this.creator && this.creator.length > 0
            && this.type && this.type.length > 0
            && this.signatureValue && this.signatureValue.length > 0
    }
}
