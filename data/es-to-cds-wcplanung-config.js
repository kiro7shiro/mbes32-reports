const ExcelJS = require('exceljs')

module.exports = {
    sheetName: 'WC-Planung',
    type: 'list',
    row: 8,
    columns: [
        {
            index: 1,
            key: 'Foyer',
            headers: [{ text: 'Foyer', row: 7, column: 1 }]
        },
        {
            index: 2,
            key: 'Halle',
            headers: [{ text: 'Halle', row: 7, column: 2 }]
        },
        {
            index: 3,
            key: 'Ebene',
            headers: [{ text: 'Ebene', row: 7, column: 3 }]
        },
        {
            index: 4,
            key: 'Ladycare',
            headers: [{ text: 'Ladycarebehälter', row: 7, column: 2 }]
        },
        {
            index: 5,
            key: 'dates',
            parser: function (cell) {
                const dateMatcher = /(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?/
                const row = cell.worksheet.getRow(cell.row)
                let parsed = []
                if (row.hasValues) {
                    for (let vCnt = 1; vCnt < row.values.length; vCnt++) {
                        const cell = row.getCell(vCnt)
                        if (cell.type === ExcelJS.ValueType.Null) continue
                        if (vCnt < 5) continue
                        if (cell.text === 'x' || cell.text === 'X') {
                            const column = cell.worksheet.getColumn(vCnt)
                            let cCnt = 1
                            for (; cCnt < column.values.length; cCnt++) {
                                const value = column.values[cCnt]
                                if (value instanceof Date) {
                                    parsed.push(value)
                                }
                                if (dateMatcher.test(value)) {
                                    const matches = dateMatcher.exec(value)
                                    const day = matches[1]
                                    const month = matches[2]
                                    const year = matches[3]
                                    // TODO : repair broken dates that miss a year at the end
                                    parsed.push(new Date(`${year}-${month}-${day}`))
                                }
                            }
                        }
                    }
                    return parsed
                } else {
                    return cell.text
                }
            }
        }
    ]
}
