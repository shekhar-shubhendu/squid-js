import {URL} from "whatwg-url"
import DDO from "../ddo/DDO"
import Config from "../models/Config"
import Logger from "../utils/Logger"
import AquariusConnectorProvider from "./AquariusConnectorProvider"
import SearchQuery from "./query/SearchQuery"

export default class Aquarius {

    private url: string

    constructor(config: Config) {

        this.url = config.aquariusUri
    }

    public async getAccessUrl(accessToken: any, payload: any): Promise<string> {

        const accessUrl: string = await AquariusConnectorProvider.getConnector()
            .post(`${accessToken.service_endpoint}/${accessToken.resource_id}`, payload)
            .then((response: any): string => {
                if (response.ok) {
                    return response.text()
                }
                Logger.error("Failed: ", response.status, response.statusText)
            })
            .then((consumptionUrl: string): string => {
                Logger.log("Success accessing consume endpoint: ", consumptionUrl)
                return consumptionUrl
            })
            .catch((error) => {
                Logger.error("Error fetching the data asset consumption url: ", error)
                return null
            })

        return accessUrl
    }

    public async queryMetadata(query: SearchQuery): Promise<any[]> {

        const result = await AquariusConnectorProvider.getConnector()
            .post(this.url + "/api/v1/aquarius/assets/ddo/query", JSON.stringify(query))
            .then((response: any) => {
                if (response.ok) {
                    return response.json()
                }
                Logger.log("Failed: ", response.status, response.statusText)
            })
            .catch((error) => {
                Logger.error("Error fetching querying metadata: ", error)
            })

        return result
    }

    public async queryMetadataByText(query: SearchQuery): Promise<any[]> {

        const fullUrl = new URL(this.url + "/api/v1/aquarius/assets/ddo/query")
        fullUrl.searchParams.append("text", query.text)
        fullUrl.searchParams.append("sort", JSON.stringify(query.sort))
        fullUrl.searchParams.append("offset", query.offset.toString())
        fullUrl.searchParams.append("page", query.page.toString())
        const result = await AquariusConnectorProvider.getConnector()
            .get(fullUrl)
            .then((response: any) => {
                if (response.ok) {
                    return response.json()
                }
                Logger.log("Failed: ", response.status, response.statusText)
            })
            .catch((error) => {
                Logger.error("Error fetching querying metadata: ", error)
            })

        return result
    }

    public async storeDDO(ddo: DDO): Promise<DDO> {
        const fullUrl = this.url + `/api/v1/aquarius/assets/ddo`
        const result: DDO = await AquariusConnectorProvider.getConnector()
            .post(fullUrl, DDO.serialize(ddo))
            .then((response: any) => {
                if (response.ok) {
                    return response.json()
                }
                Logger.log("Failed:", response.status, response.statusText)
            })
            .catch((error) => {
                Logger.error("Error fetching querying metadata: ", error)
            })

        return result
    }

    public async retrieveDDO(did: string): Promise<DDO> {
        const fullUrl = this.url + `/api/v1/aquarius/assets/ddo/${did}`
        const result = await AquariusConnectorProvider.getConnector()
            .get(fullUrl)
            .then((response: any) => {
                if (response.ok) {
                    return response.json()
                }
                Logger.log("Failed:", response.status, response.statusText)
            })
            .catch((error) => {
                Logger.error("Error fetching querying metadata: ", error)
            })

        return result
    }
}
