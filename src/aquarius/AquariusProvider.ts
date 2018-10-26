import Aquarius from "./Aquarius"

export default class AquariusProvider {

    public static setAquarius(aquarius: Aquarius) {

        AquariusProvider.aquarius = aquarius
    }

    public static getAquarius() {

        if (!AquariusProvider.aquarius) {
            AquariusProvider.aquarius = new Aquarius()
        }
        return AquariusProvider.aquarius
    }

    private static aquarius: Aquarius = null
}
