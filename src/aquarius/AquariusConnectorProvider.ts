import Logger from "../utils/Logger"
import AquariusConnector from "./AquariusConnector"

export default class AquariusConnectorProvider {

    public static setConnector(connector: AquariusConnector) {

        Logger.log("setting", typeof connector.constructor.name)

        AquariusConnectorProvider.connector = connector
    }

    public static getConnector() {

        if (!AquariusConnectorProvider.connector) {
            AquariusConnectorProvider.connector = new AquariusConnector()
        }
        Logger.log("getting", typeof AquariusConnectorProvider.connector.constructor.name)
        return AquariusConnectorProvider.connector
    }

    private static connector: AquariusConnector = null
}
