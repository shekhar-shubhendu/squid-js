import Config from "../models/Config"

export default class Brizo {
    private url: string

    constructor(config: Config) {

        this.url = config.brizoUri
    }

    public getPurchaseEndpoint() {
        return `${this.url}/api/v1/brizo/services/access/purchase?`
    }

    public getConsumeEndpoint(pubKey: string, serviceId: string, url: string) {
        return `${this.url}/api/v1/brizo/services/consume?pubKey=${pubKey}&serviceId=${serviceId}&url=${url}`
    }

    public getComputeEndpoint(pubKey: string, serviceId: string, algo: string, container: string) {
        // tslint:disable-next-line
        return `${this.url}/api/v1/brizo/services/compute?pubKey=${pubKey}&serviceId=${serviceId}&algo=${algo}&container=${container}"`
    }
}
