import fetch from "node-fetch"

export default class AquariusConnector {

    public async post(url, payload): Promise<any> {
        return this.fetch(url, {
            method: "POST",
            body: payload,
        })
    }

    public async get(url): Promise<any> {
        return this.fetch(url, {
            method: "GET",
        })
    }

    public async put(url, payload): Promise<any> {
        return this.fetch(url, {
            method: "PUT",
            body: payload,
        })
    }

    private async fetch(url, opts): Promise<any> {
        return fetch(url, opts)
    }
}
