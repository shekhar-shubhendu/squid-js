import fetch from "node-fetch"

export default class WebServiceConnector {

    public async post(url, payload): Promise<any> {
        return this.fetch(url, {
            method: "POST",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public async get(url): Promise<any> {
        return this.fetch(url, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    public async put(url, payload): Promise<any> {
        return this.fetch(url, {
            method: "PUT",
            body: payload,
            headers: {
                "Content-type": "application/json",
            },
        })
    }

    private async fetch(url, opts): Promise<any> {
        return fetch(url, opts)
    }
}
