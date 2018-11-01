import Curation from "./Curation"
import StructuredMarkup from "./StructuredMarkup"
import AdditionalInformation from "./AdditionalInformation"
import MetaDataBase from "./MetaDataBase"

export default class MetaData {

    public base: MetaDataBase = {
        name: "UK Weather information 2011",
        type: "dataset",
        description: "Weather information of UK including temperature and humidity",
        size: "3.1gb",
        dateCreated: "2012-10-10T17:00:000Z",
        author: "Met Office",
        license: "CC-BY",
        copyrightHolder: "Met Office",
        encoding: "UTF-8",
        compression: "zip",
        contentType: "text/csv",
        workExample: "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
        contentUrls: [
            "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
        ],
        links: [
            {
                sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/",
            },
            {
                sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/",
            },
            {
                fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
            },
        ],
        inLanguage: "en",
        tags: "weather, uk, 2011, temperature, humidity",
        price: 10,
    } as MetaDataBase

    public curation: Curation = {
        rating: 0.93,
        numVotes: 123,
        schema: "Binary Votting",
    } as Curation

    public additionalInformation: AdditionalInformation = {
        updateFrecuency: "yearly",
        structuredMarkup: [
            {
                uri: "http://skos.um.es/unescothes/C01194/jsonld",
                mediaType: "application/ld+json",
            } as StructuredMarkup,
            {
                uri: "http://skos.um.es/unescothes/C01194/turtle",
                mediaType: "text/turtle",
            } as StructuredMarkup,
        ],
    } as AdditionalInformation
}
