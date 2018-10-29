import fetch from "node-fetch"
import URL from "url"

export default class AquariusConnector {

    public post(url, payload) {
        return fetch(url, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public get(url, payload) {
        const fullUrl = new URL(url)
        for (const key of Object.keys(payload)) {
          fullUrl.searchParams.append(key, payload[key])
        }
        return fetch(fullUrl, {
            method: "GET",
            body: null,
            headers: {
                "Content-type": "application/json",
            },
        })
    }
}
