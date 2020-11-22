const { equal } = require("assert");
const axios = require("axios");
const cheerio = require("cheerio");
const xlsx = require("xlsx")

const wb = xlsx.readFile("ArtPrices.xlsx");
const ws = wb.Sheets["InitialData"];
const rs = wb.Sheets["Result"];
const data = xlsx.utils.sheet_to_json(ws)

const arrayOfArticles = data.map(obj => Number(obj.Article));
console.log(arrayOfArticles);
let resultPriceArray = [];

const parse = async (pageUrl) => {
    const getHTML = async (url) => {
        const { data } = await axios.get(url)
        return cheerio.load(data)
    }

    const $ = await getHTML(pageUrl);
    let pageNumber = $("a.o1ojzgcq_plp").eq(-1).text()

    for(let i = 1; i <=pageNumber+1; i++) {
        const selector = await getHTML(`${pageUrl}?page=${i}`)
        selector("div.phytpj4_plp").each((i,element) => {
            const article = Number(selector(element)
            .find("span.sn92g85_plp")
            .text()
            .slice(5))
            const price = Number(selector(element)
            .find("p.xc1n09g_plp")
            .text()
            .replace(/\s/g, ''))
            if (arrayOfArticles.includes(article)){
                resultPriceArray[arrayOfArticles.indexOf(article)] = price
            }
        })
    }
}

const frames = "https://novosibirsk.leroymerlin.ru/catalogue/korpusa-shkafov-dlya-proektnyh-kuhon"
const facade = "https://novosibirsk.leroymerlin.ru/catalogue/fasady-shkafov-dlya-proektnyh-kuhon"
const petli = "https://novosibirsk.leroymerlin.ru/catalogue/ruchki-i-petli-dlya-kuhonnyh-shkafov"
const yashiki = "https://novosibirsk.leroymerlin.ru/catalogue/yashchiki-vydvizhnye-dlya-kuhonnyh-shkafov"

console.log("Идет процесс обработки... Примерное время обработки 5 мин.")
console.log("Пожалуйста не закрывайте окно до окончания работы программы!")




Promise.all([parse(frames), parse(petli), parse(yashiki), parse(facade)]).then(() => {
    let newData = data.map((record, i) => {
        record.Price = resultPriceArray[i]
        return record
        })
    console.log(newData)
    wb.Sheets["Result"] = xlsx.utils.json_to_sheet(newData)
    xlsx.writeFile(wb, "ArtPrices.xlsx")
}).then(()=>{
    console.log("Обработка успешно завершена.\nНажмите Enter для выхода...")
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}).catch(error => console.log('Ошибка выполнения. Пожалуйста убедитесь что данные введены корректно и исполняемый файл закрыт на момент работы программы', error));