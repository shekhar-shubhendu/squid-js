import ConfigProvider from "../ConfigProvider"
import Brizo from "./Brizo"

export default class BrizoProvider {

    public static setBrizo(brizo: Brizo) {

        BrizoProvider.brizo = brizo
    }

    public static getBrizo() {

        if (!BrizoProvider.brizo) {
            BrizoProvider.brizo = new Brizo(ConfigProvider.getConfig())
        }
        return BrizoProvider.brizo
    }

    private static brizo: Brizo = null
}
