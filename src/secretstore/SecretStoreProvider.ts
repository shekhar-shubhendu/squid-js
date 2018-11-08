import SecretStore from "@oceanprotocol/secret-store-client"
import ConfigProvider from "../ConfigProvider"

export default class SecretStoreProvider {

    public static setSecretStore(secretStore: SecretStore) {

        SecretStoreProvider.secretStore = secretStore
    }

    public static getSecretStore(): SecretStore {

        if (!SecretStoreProvider.secretStore) {
            SecretStoreProvider.secretStore = new SecretStore(ConfigProvider.getConfig())
        }

        return SecretStoreProvider.secretStore
    }

    private static secretStore: SecretStore
}
