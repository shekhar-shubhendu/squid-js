export default class Proof {
    
    
    public created: string
    public creator: string
    public type: string
    public signatureValue: string

    public constructor(data?: any) {
        this.created = data['created']
        this.creator = data['creator']
        this.type = data['type']
        this.signatureValue = data['signatureValue']
    }
    
    public toData(): object {
        return {
            'created': this.created,
            'creator': this.creator,
            'type': this.type,
            'signatureValue': this.signatureValue
        }
    }
    public isValid(): boolean {
        return this.created != '' && this.creator != '' && this.type != ''
            && this.signatureValue != ''
    }    
}

