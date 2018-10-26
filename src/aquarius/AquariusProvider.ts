export default class AquariusProvider {

    public static setAquarius(aquarius) {

        AquariusProvider.aquarius = aquarius
    }

    public static getAquarius() {

        return AquariusProvider.aquarius
    }

    private static aquarius
}
