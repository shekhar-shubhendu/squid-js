import Config from "../models/Config"
import WebServiceConnectorProvider from "../utils/WebServiceConnectorProvider"

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

    public async initializeServiceAgreement(did: string, serviceAgreementId: string, serviceDefinitionId: string,
                                            signature: string, consumerPublicKey: string): Promise<any> {

        return WebServiceConnectorProvider.getConnector().post(
            `${this.url}/api/v1/brizo/services/access/initialize`,
            {
                did,
                serviceAgreementId,
                serviceDefinitionId,
                signature,
                consumerPublicKey,
            })

    }
}
