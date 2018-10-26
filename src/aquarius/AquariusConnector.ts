import fetch from "node-fetch"

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
}
