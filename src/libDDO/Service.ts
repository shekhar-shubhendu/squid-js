export default class Service {
    
    
    public did: string
    public endpoint: string
    public type: string
    public values: object

    public constructor(data?: any) {
        this.did = data['id']
        this.endpoint = data['serviceEndpoint']
        this.type = data['type']
        this.values = Object.assign({}, data)
        delete this.values['id']
        delete this.values['serviceEndpoint']
        delete this.values['type']
    }
    
    public toData(): object {
        var data = {
            'id': this.did,
            'serviceEndpoint': this.endpoint,
            'type': this.type
        }
        if (Object.keys(this.values).length > 0) {
            data = Object.assign(data, this.values)
        }
        return data
    }
    
    public isValid(): boolean {
        return this.did && this.did.length > 0 
            && this.endpoint && this.endpoint.length > 0 
            && this.type && this.type.length > 0
    }
    
}

