import Config from "../models/Config"
import WebServiceConnectorProvider from "../utils/WebServiceConnectorProvider"

const apiPath = "/api/v1/brizo/services"

export default class Brizo {
    private url: string

    constructor(config: Config) {

        this.url = config.brizoUri
    }

    public getPurchaseEndpoint() {
        return `${this.url}${apiPath}/access/purchase?`
    }

    public getConsumeEndpoint(pubKey: string, serviceId: string, url: string) {
        return `${this.url}${apiPath}/consume?pubKey=${pubKey}&serviceId=${serviceId}&url=${url}`
    }

    public getComputeEndpoint(pubKey: string, serviceId: string, algo: string, container: string) {
        // tslint:disable-next-line
        return `${this.url}${apiPath}/compute?pubKey=${pubKey}&serviceId=${serviceId}&algo=${algo}&container=${container}"`
    }

    public async initializeServiceAgreement(
        did: string,
        serviceAgreementId: string,
        serviceDefinitionId: string,
        signature: string,
        consumerAddress: string): Promise<any> {

        return WebServiceConnectorProvider
            .getConnector()
            .post(
                `${this.url}${apiPath}/access/initialize`,
                JSON.stringify({
                    did,
                    serviceAgreementId,
                    serviceDefinitionId,
                    signature,
                    consumerAddress,
                }),
            )

    }
}
