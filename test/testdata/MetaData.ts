import MetaDataModel from "../../src/ddo/MetaData"
import MetaDataBase from "../../src/ddo/MetaDataBase"

const MetaData = new MetaDataModel({
    base: {
        name: "Office Humidity",
        type: "dataset",
        description: "Weather information of UK including temperature and humidity",
        size: "3.1gb",
        dateCreated: "2012-02-01T10:55:11+00:00",
        author: "Met Office",
        license: "CC-BY",
        copyrightHolder: "Met Office",
        encoding: "UTF-8",
        compression: "zip",
        contentType: "text/csv",
        // tslint:disable-next-line
        workExample: "stationId,latitude,longitude,datetime,temperature,humidity423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68",
        contentUrls: [
            "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
            "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
        ],
        links: [
            {sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/"},
            {sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/"},
            {fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/"},
        ],
        inLanguage: "en",
        tags: "weather, uk, 2011, temperature, humidity",
        price: 10,
    } as MetaDataBase,
} as MetaDataModel)

export default MetaData
