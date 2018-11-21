import WebServiceConnector from "./WebServiceConnector"

export default class WebServiceConnectorProvider {

    public static setConnector(connector: WebServiceConnector) {

        WebServiceConnectorProvider.instance = connector
    }

    public static getConnector(): WebServiceConnector {

        if (!WebServiceConnectorProvider.instance) {
            WebServiceConnectorProvider.instance = new WebServiceConnector()
        }
        return WebServiceConnectorProvider.instance
    }

    private static instance: WebServiceConnector = null
}
