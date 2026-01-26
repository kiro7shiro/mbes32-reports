module.exports = {
    sheetName: 'Kostenzusammenstellung ',
    type: 'object',
    fields: [
        {
            key: 'matchcode',
            row: 1,
            column: 1,
            parser: function (cell) {
                const extractMatchcode = /\w*\s*[\wÄÖÜäöü]*\s*\d{2,4}\w*/
                const matcher = extractMatchcode.exec(cell.text)
                if (matcher !== null) {
                    return matcher[0].trim()
                } else {
                    cell.text
                }
            }
        },
        {
            key: 'title',
            row: 1,
            column: 1,
            parser: function (cell) {
                return cell.text.replace('Veranstaltung:', '').trim()
            }
        },
        {
            key: 'dates',
            row: 1,
            column: 1,
            parser: function (cell) {
                // extract dates from title
                const extractDate =
                    /(\d{1,2})\.\s*(\d{1,2}\.|januar|jan|februar|feb|märz|mrz|april|apr|mai|juni|jun|july|jul|august|aug|september|sep|oktober|okt|november|nov|dezember|dez)?\.?\s*(\d{2,4})?/gi
                const monthMap = [
                    /januar|jan/i,
                    /februar|feb/i,
                    /märz|mrz/i,
                    /april|apr/i,
                    /mai/i,
                    /juni|jun/i,
                    /july|jul/i,
                    /august|aug/i,
                    /september|sep/i,
                    /oktober|okt/i,
                    /november|nov/i,
                    /dezember|dez/i
                ]
                let matcher = extractDate.exec(cell.text)
                if (matcher !== null) {
                    const matches = []
                    // collect matches
                    while (matcher !== null) {
                        const [_, day, month, year] = matcher
                        //console.log(matcher, { day, month, year })
                        matches.push([day, month, year])
                        matcher = extractDate.exec(cell.text)
                    }
                    //console.log(matches)
                    // parse dates
                    const [start, end] = matches.map(function (parts, index) {
                        // replace unset parts
                        const newParts = parts.map(function (str, i) {
                            return str === undefined ? matches[(index + 1) % matches.length][i] : str
                        })
                        //console.log(index, value)
                        //console.log(newValue)
                        // format parts
                        let [day, month, year] = newParts
                        if (isNaN(month)) {
                            month = monthMap.findIndex(function (m) {
                                return m.test(month)
                            }) + 1
                        }
                        day = day.padStart(2, '0')
                        month = month.toString().replaceAll('.', '').padStart(2, '0')
                        year = year.padStart(4, '20')
                        //console.log(year, month, day)
                        return new Date(`${year}-${month}-${day}T00:00:00Z`)
                    })
                    //console.log({ start, end })
                    return { start, end }
                } else {
                    // no dates present in title
                    return null
                }
            }
        }
    ]
}
