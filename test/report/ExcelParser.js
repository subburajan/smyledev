

function main1() {
	var excelParser = require('excel-parser');
	console.log(__dirname);
	excelParser.worksheets({
	  inFile: __dirname + '/test.xlsx'
	}, function(err, worksheets) {
	  if(err) console.error(err);
	  console.log(worksheets);
	});
}

function main() {
	var parseXlsx = require('excel');

parseXlsx(__dirname + '/test.xlsx', function(err, data) {
    if(err) throw err;
    console.log(JSON.stringify(data));
    // data is an array of arrays
});
}
main();
