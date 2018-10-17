export default class ProviderProvider {

    public static setProvider(provider) {

        ProviderProvider.provider = provider
    }

    public static getProvider() {

        return ProviderProvider.provider
    }

    private static provider
}
