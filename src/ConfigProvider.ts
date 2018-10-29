import Config from "./models/Config"

export default class ConfigProvider {

    public static getConfig(): Config {
        return ConfigProvider.config
    }

    public static setConfig(config: Config) {

        ConfigProvider.config = config
    }

    private static config: Config
}
