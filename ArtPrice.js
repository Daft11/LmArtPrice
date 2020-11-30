const { equal } = require("assert");
const axios = require("axios");
const cheerio = require("cheerio");
const xlsx = require("xlsx");
const cliProgress = require("cli-progress");

const articleSource = xlsx.readFile("PriceList.xlsx");
const wb = xlsx.readFile("ArtPrices.xlsx");
// const ws = wb.Sheets["InitialData"];
const data = [];
let arrayOfArticles = [];

for (let sheetIndex in articleSource.Sheets) {
	var sheet = articleSource.Sheets[sheetIndex];
	for (var cellIndex in sheet) {
		var attr = sheet[cellIndex];
		if (attr.t == "n" && (attr.w.length == 8 || attr.w.length == 6)) {
			arrayOfArticles.push(attr.v);
			data.push({ Article: attr.v });
		}
	}
}

console.log(arrayOfArticles);
let resultPriceArray = [];
console.log("Идет процесс обработки... Примерное время обработки 5 мин.");
console.log("Пожалуйста не закрывайте окно до окончания работы программы!");

let bar = [];
const multibar = new cliProgress.MultiBar(
	{
		clearOnComplete: false,
		hideCursor: true,
	},
	cliProgress.Presets.shades_grey
);
const parse = async (pageUrl, id) => {
	const getHTML = async (url) => {
		const { data } = await axios.get(url);
		return cheerio.load(data);
	};

	const $ = await getHTML(pageUrl);
	let pageNumber = Number($("a.o1ojzgcq_plp").eq(-1).text());

	bar[id] = multibar.create(pageNumber + 1, 0);

	for (let i = 1; i <= pageNumber + 1; i++) {
		bar[id].increment(); //consoleProgressBar
		const selector = await getHTML(`${pageUrl}?page=${i}`);
		selector("div.phytpj4_plp").each((i, element) => {
			const article = Number(
				selector(element).find("span.sn92g85_plp").text().slice(5)
			);
			const price = Number(
				selector(element).find("p.xc1n09g_plp").text().replace(/\s/g, "")
			);
			if (arrayOfArticles.includes(article)) {
				resultPriceArray[arrayOfArticles.indexOf(article)] = price;
			}
		});
	}
};

const frames =
	"https://novosibirsk.leroymerlin.ru/catalogue/korpusa-shkafov-dlya-proektnyh-kuhon";
const facade =
	"https://novosibirsk.leroymerlin.ru/catalogue/fasady-shkafov-dlya-proektnyh-kuhon";
const petli =
	"https://novosibirsk.leroymerlin.ru/catalogue/ruchki-i-petli-dlya-kuhonnyh-shkafov";
const yashiki =
	"https://novosibirsk.leroymerlin.ru/catalogue/yashchiki-vydvizhnye-dlya-kuhonnyh-shkafov";

Promise.all([
	parse(frames, 0),
	parse(petli, 1),
	parse(yashiki, 2),
	parse(facade, 3),
])
	.then(() => {
		console.log("\nПоиск завершен. Идет запись в файл");
		let newData = data.map((record, i) => {
			record.Price = resultPriceArray[i];
			return record;
		});
		wb.Sheets["Result"] = xlsx.utils.json_to_sheet(newData);
		xlsx.writeFile(wb, "ArtPrices.xlsx");
	})
	.then(() => {
		console.log("\nОбработка успешно завершена.\nНажмите Enter для выхода...");
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.on("data", process.exit.bind(process, 0));
	})
	.catch((error) =>
		console.log(
			"Ошибка выполнения. Пожалуйста убедитесь что данные введены корректно и исполняемый файл закрыт на момент работы программы",
			error
		)
	);
