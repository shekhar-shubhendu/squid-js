import Config from "../models/Config"
import Logger from "../utils/Logger"
import AquariusConnectorProvider from "./AquariusConnectorProvider"

export default class Aquarius {

    private url: string

    constructor(config: Config) {

        this.url = config.aquariusUri
    }

    public async getAccessUrl(accessToken: any, payload: any): Promise<string> {

        const accessUrl = await AquariusConnectorProvider.getConnector().post(
            `${accessToken.service_endpoint}/${accessToken.resource_id}`,
            payload)
            .then((response: any) => {
                if (response.ok) {
                    return response.text()
                }
                Logger.log("Failed: ", response.status, response.statusText)
            })
            .then((consumptionUrl: string) => {
                Logger.log("Success accessing consume endpoint: ", consumptionUrl)
                return consumptionUrl
            })
            .catch((error) => {
                Logger.error("Error fetching the data asset consumption url: ", error)
            })

        return accessUrl
    }

    public async queryMetadata(query): Promise<any[]> {

        const result = await AquariusConnectorProvider.getConnector().post(
            this.url + "/api/v1/aquarius/assets/metadata/query",
            JSON.stringify(query))
            .then((response: any) => {
                if (response.ok) {
                    return response.json()
                }
                Logger.log("Failed: ", response.status, response.statusText)
            })
            .catch((error) => {
                Logger.error("Error fetching querying metdata: ", error)
            })

        return result
    }
}
