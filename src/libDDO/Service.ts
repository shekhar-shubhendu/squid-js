
interface IService {
    id?: string
    serviceEndpoint?: string
    type?: string
}

export default class Service {

    public did: string
    public endpoint: string
    public type: string
    public values: object

    public constructor(data?: IService) {
        this.did = data.id
        this.endpoint = data.serviceEndpoint
        this.type = data.type
        this.values = Object.assign({}, data)

        // remove any valid keys from the 'values'
        const dataRef: IService = this.values
        delete dataRef.id
        delete dataRef.serviceEndpoint
        delete dataRef.type
    }

    public toData(): IService {
        let data: IService = {
            id: this.did,
            serviceEndpoint: this.endpoint,
            type: this.type,
        }
        if (Object.keys(this.values).length > 0) {
            data = Object.assign(data, this.values)
        }
        return data as IService
    }

    public isValid(): boolean {
        return this.did && this.did.length > 0
            && this.endpoint && this.endpoint.length > 0
            && this.type && this.type.length > 0
    }

}
