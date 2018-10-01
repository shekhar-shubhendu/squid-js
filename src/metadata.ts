import Config from "./models/Config";
import Logger from "./utils/Logger";

declare var fetch;

export default class MetaData {

    private assetsUrl: string;

    constructor(config: Config) {
        const providerUri = config.providerUri || null;

        this.assetsUrl = providerUri + "/assets";
    }

    public getAssetsMetadata() {
        return fetch(this.assetsUrl + "/metadata", {method: "GET"})
            .then((res) => res.json())
            .then((data) => JSON.parse(data));
    }

    public publishDataAsset(asset: object) {
        return fetch(this.assetsUrl + "/metadata",
            {
                method: "POST",
                body: JSON.stringify(asset),
                headers: {"Content-type": "application/json"},
            })
            .then((response: any) => {
                Logger.log("Success:", response);
                if (response.ok) {
                    Logger.log("Success:", response);
                    return true;
                }
                Logger.log("Failed: ", response.status, response.statusText);
                return false;
                // throw new Error(response.statusText ? response.statusText :
                // `publish asset failed with status ${response.status}`)
            })
            .catch((error: Error) => {
                Logger.log(`Publish asset to ocean database could not be completed: ${error.message}`);
                return false;
            });
    }
}
