import fetch from "node-fetch"
import ConfigProvider from "../ConfigProvider"
import Logger from "../utils/Logger"

export default class Aquarius {

    private url: string

    constructor() {

        this.url = ConfigProvider.getConfig().aquariusUri
    }

    public async getAccessUrl(accessToken: any, payload: any): Promise<string> {

        const accessUrl = await fetch(`${accessToken.service_endpoint}/${accessToken.resource_id}`, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
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

        const result = await fetch(this.url + "/api/v1/aquarius/assets/metadata/query", {
            method: "POST",
            body: JSON.stringify(query),
            headers: {
                "Content-type": "application/json",
            },
        })
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
