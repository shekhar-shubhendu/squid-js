import AquariusConnector from "./AquariusConnector"

export default class AquariusConnectorProvider {

    public static setConnector(connector: AquariusConnector) {

        AquariusConnectorProvider.connector = connector
    }

    public static getConnector() {

        if (!AquariusConnectorProvider.connector) {
            AquariusConnectorProvider.connector = new AquariusConnector()
        }
        return AquariusConnectorProvider.connector
    }

    private static connector: AquariusConnector = null
}
