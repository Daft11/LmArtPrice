const xlsx = require("xlsx");

const wb = xlsx.readFile("PriceList.xlsx");

for (let sheetIndex in wb.Sheets) {
	var ws = wb.Sheets[sheetIndex];
	for (var cellIndex in ws) {
		var attr = ws[cellIndex];
		if (attr.t == "n" && (attr.w.length == 8 || attr.w.length == 6))
			console.log(attr.v);
	}
}

// console.log(wb);
