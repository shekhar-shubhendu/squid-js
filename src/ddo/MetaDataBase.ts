export default class MetaDataBase {
    public name: string = "UK Weather information 2011"
    public type: string = "dataset"
    public description: string = "Weather information of UK including temperature and humidity"
    public size: string = "3.1gb"
    public dateCreated: string = "2012-10-10T17:00:000Z"
    public author: string = "Met Office"
    public license: string = "CC-BY"
    public copyrightHolder: string = "Met Office"
    public encoding: string = "UTF-8"
    public compression: string = "zip"
    public contentType: string = "text/csv"
    public workExample: string = "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68"
    public contentUrls: string | string[] = [
        "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
        "https://testocnfiles.blob.core.windows.net/testfiles/testzkp.zip",
    ]
    public links: any[] = [
        {
            sample1: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/",
        },
        {
            sample2: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-averages-25km/",
        },
        {
            fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
        },
    ]
    public inLanguage: string = "en"
    public tags: string = "weather, uk, 2011, temperature, humidity"
    public price: number = 10
}
