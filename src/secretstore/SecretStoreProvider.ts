import SecretStore from "@oceanprotocol/secret-store-client"

export default class SecretStoreProvider {

    public static getSecretStore() {

        if (!SecretStoreProvider.secretStore) {
            SecretStoreProvider.secretStore = new SecretStore(SecretStoreProvider.config)
        }

        return SecretStoreProvider.secretStore
    }

    public static configure(config: {
        secretStoreUri: string, parityUri: string,
        address: string, password: string, threshold?: number,
    }) {

        SecretStoreProvider.config = config
    }

    private static config: any
    private static secretStore: SecretStore
}
