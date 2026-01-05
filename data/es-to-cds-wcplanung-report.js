const { EventFile } = require('../src/EventFile.js')

module.exports = {
	Planungen: {
		sheetName: 'Planungen',
		row: 1,
		type: 'list',
		columns: [
			{
				index: 1,
				key: '',
				formatter: function (data) {
					const eventFile = new EventFile(data.filename)
					console.log(eventFile)
				}
			}
		]
	}
}
