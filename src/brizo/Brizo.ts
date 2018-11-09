import Config from "../models/Config"

export default class Brizo {
    private url: string

    constructor(config: Config) {

        this.url = config.brizoUri
    }

    public getPurchaseEndpoint() {
        return `${this.url}/api/v1/brizo/services/access/purchase?`
    }

    public getServiceEndpoint(pubKey: string, serviceId: string, url: string) {
        return `${this.url}/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId=${serviceId}&url=${url}`
    }
}
