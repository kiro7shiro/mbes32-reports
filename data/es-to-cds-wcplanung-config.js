const ExcelJS = require('exceljs')

module.exports = {
    timeline: {
        sheetName: 'WC-Planung',
        type: 'object',
        fields: [
            {
                key: 'date',
                row: 1,
                column: 1,
                parser: function (cell) {
                    const dateMatchers = [
                        {
                            matcher: /(vom)?\s(\d{1,2})\.?\s(bis|\-)?\s(\d{1,2})\.?(\d{1,2}|\s\w+\s)\.?(\d{2,4})/gm,
                            groupMap: [2, 5, 6]
                        },
                        {
                            matcher: /(am)?\s(\d{1,2})\.(\d{1,2})\.(\d{2,4})/gm,
                            groupMap: [2, 3, 4]
                        }
                    ]
                    const [matches] = dateMatchers.reduce(function (accu, curr) {
                        const match = curr.matcher.exec(cell.text)
                        if (match === null) return accu
                        const day = match[curr.groupMap[0]].trim()
                        const month = match[curr.groupMap[1]].trim()
                        const year = match[curr.groupMap[2]].trim()
                        const date = new Date(`${year}-${month}-${day}`)
                        //console.log(date.toLocaleDateString())
                        accu.push(date)
                        return accu
                    }, [])
                    //console.log(matches)
                    return matches
                }
            }
        ]
    },
    restrooms: {
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
}
