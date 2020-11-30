const xlsx = require("xlsx");

const wb = xlsx.readFile("ArtPrices.xlsx");
const ws = wb.Sheets["InitialData"];
const data = xlsx.utils.sheet_to_json(ws);

console.log(data);

// const wb = xlsx.readFile("PriceList.xlsx");

// for (let sheetIndex in wb.Sheets) {
// 	var ws = wb.Sheets[sheetIndex];
// 	for (var cellIndex in ws) {
// 		var attr = ws[cellIndex];
// 		if (attr.t == "n" && (attr.w.length == 8 || attr.w.length == 6))
// 			console.log(attr.v);
// 	}
// }

// console.log(wb);
