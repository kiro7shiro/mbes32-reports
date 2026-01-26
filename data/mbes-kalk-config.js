const ExcelJS = require('exceljs')

function markPrice(cell) {
    //console.log(cell)
    //console.log(cell.col)
    let result = cell.text
    if (cell.type === ExcelJS.ValueType.Formula) {
        const priceMap = {
            standard: /\$c\$\d+/i,
            gaenge: /\$d\$\d+/i,
            kongress: /\$o\$\d+/i
        }
        //console.log(cell.formula)
        for (const key in priceMap) {
            if (!Object.hasOwn(priceMap, key)) continue
            const matcher = priceMap[key]
            const matches = matcher.exec(cell.formula)
            //console.log(matches)
            if (matches !== null) {
                result = {
                    value: cell.text,
                    type: key
                }
                break
            }
        }
    }
    return result
}

function calcHours(params) {
    
}

module.exports = {
    Hallen: {
        sheetName: 'Hallen',
        type: 'list',
        row: 15,
        columns: [
            { index: 1, key: 'Halle', headers: [{ text: 'Halle', row: 14, column: 1 }] },
            { index: 2, key: 'Fläche', headers: [{ text: 'Fläche', row: 14, column: 2 }] },
            { index: 3, key: 'Flächen-anteil', headers: [{ text: 'Flächen-anteil', row: 14, column: 3 }] },
            { index: 4, key: 'VR Aufbau', headers: [{ text: 'VR Aufbau', row: 14, column: 4 }] },
            { index: 5, key: 'finale Vor-reinig.', headers: [{ text: 'Vor-reinig.', row: 14, column: 5 }] },
            { index: 6, key: '40% lfd. VR Nacht', headers: [{ text: 'lfd. VR Nacht', row: 14, column: 6 }] },
            { index: 7, key: '100% lfd. VR Nacht', headers: [{ text: 'lfd. VR Nacht', row: 14, column: 7 }] },
            { index: 8, key: '40% lfd. Tag', headers: [{ text: 'lfd. Tag', row: 14, column: 8 }] },
            { index: 9, key: '100% lfd. Tag', headers: [{ text: 'lfd. Tag', row: 14, column: 9 }] },
            { index: 10, key: 'Nachreinigung', headers: [{ text: 'Nach-reinig.', row: 14, column: 10 }] },
            { index: 11, key: 'LE VR Aufbau', headers: [{ text: 'VR Aufbau', row: 14, column: 11 }], parser: markPrice },
            { index: 12, key: 'LE Vorrein.', headers: [{ text: 'Vorrein.', row: 14, column: 12 }], parser: markPrice },
            { index: 13, key: 'LE lfd. Nacht', headers: [{ text: 'lfd. Nacht', row: 14, column: 13 }], parser: markPrice },
            { index: 14, key: 'LE lfd. Tag', headers: [{ text: 'lfd. Tag', row: 14, column: 14 }], parser: markPrice },
            { index: 15, key: 'LE Nachreinigung', headers: [{ text: 'Nachrein.', row: 14, column: 15 }], parser: markPrice }
        ]
    },
    Verkehr: {
        sheetName: 'Verkehr',
        type: 'list',
        row: 13,
        columns: [
            { index: 1, key: 'Halle', headers: [{ text: 'Halle', row: 12, column: 1 }] },
            { index: 2, key: 'Details/Ortsangabe', headers: [{ text: 'Details/\nOrtsangabe', row: 12, column: 2 }] },
            { index: 3, key: 'Ebene', headers: [{ text: 'Ebene', row: 12, column: 3 }] },
            { index: 4, key: 'Fläche', headers: [{ text: 'Fläche', row: 12, column: 4 }] },
            { index: 6, key: 'VR Aufbau', headers: [{ text: 'VR Aufbau', row: 12, column: 6 }] },
            { index: 7, key: 'finale Vor-reinig.', headers: [{ text: 'Vor-reinig.', row: 12, column: 7 }] },
            { index: 8, key: 'lfd. VR Nacht', headers: [{ text: 'lfd. VR Nacht', row: 12, column: 8 }] },
            { index: 9, key: 'lfd. Tag', headers: [{ text: 'lfd. Tag', row: 12, column: 9 }] },
            { index: 10, key: 'Nachreinigung', headers: [{ text: 'NR', row: 12, column: 10 }] }
        ]
    },
    DiverseZusatzarbeiten: {
        sheetName: 'diverse Zusatzarbeiten',
        type: 'list',
        row: 9,
        columns: [
            { index: 1, key: 'Datum', headers: [{ text: 'Datum', row: 8, column: 1 }] },
            { index: 2, key: 'Leistung', headers: [{ text: 'Leistung', row: 8, column: 2 }] },
            { index: 3, key: 'Anzahl MA', headers: [{ text: 'Anzahl MA', row: 8, column: 3 }] },
            { index: 4, key: 'Zeitraum', headers: [{ text: 'Zeitraum', row: 8, column: 4 }] },
            { index: 5, key: 'Stunden', headers: [{ text: 'Stunden', row: 8, column: 5 }] },
            { index: 6, key: 'Std.-Satz', headers: [{ text: 'Std.-Satz', row: 8, column: 6 }] },
            { index: 7, key: 'Entgelt', headers: [{ text: 'Entgelt', row: 8, column: 7 }] }
        ]
    }
}
