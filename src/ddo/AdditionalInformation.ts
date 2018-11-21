import StructuredMarkup from "./StructuredMarkup"

export default class AdditionalInformation {
    public updateFrecuency: string = "yearly"
    public structuredMarkup: StructuredMarkup[] = [
        {
            uri: "http://skos.um.es/unescothes/C01194/jsonld",
            mediaType: "application/ld+json",
        } as StructuredMarkup,
        {
            uri: "http://skos.um.es/unescothes/C01194/turtle",
            mediaType: "text/turtle",
        }as StructuredMarkup,
    ]
    public checksum: string
}
