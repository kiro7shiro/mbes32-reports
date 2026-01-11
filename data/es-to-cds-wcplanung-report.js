module.exports = {
    sheetName: 'WC-Planung',
    row: 8,
    type: 'list',
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
            formatter: function ({ dates }, cell) {
                const row = cell.worksheet.getRow(cell.row)
                row.splice(5, dates.length, ...dates)
                return null
            }
        }
    ]
}
