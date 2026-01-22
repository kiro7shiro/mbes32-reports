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
            column: 1
        },
        {
            key: 'dates',
            row: 1,
            column: 1,
            parser: function (cell) {
                // extract dates from title
                const extractDate =
                    /(\d{1,2})\.\s*(\d{1,2}\.|januar|jan|februar|feb|märz|mrz|april|apr|mai|juni|jun|july|jul|august|aug|september|sep|oktober|okt|november|nov|dezember|dez)?\.?\s*(\d{2,4})?/gi
                let matcher = extractDate.exec(cell.text)
                if (matcher !== null) {
                    const parts = []
                    while (matcher !== null) {
                        const [_, day, month, year] = matcher
                        //console.log(matcher, { day, month, year })
                        parts.push([day, month, year])
                        matcher = extractDate.exec(cell.text)
                    }
                    if (parts.length < 2) {
                        // only one date is present
                        const [startStr] = parts
                        let date = new Date(startStr.join(' '))
                        if (isNaN(date.getTime())) {
                            date = new Date(`${startStr[2]}-${startStr[1].replace('.', '')}-${startStr[0]}T00:00:00Z`)
                        }
                        //console.log({ start: date.toLocaleDateString(), end: date.toLocaleDateString() })
                        return { start: date, end: date }
                    }
                    // replace empty parts
                    const [startStr, endStr] = parts
                    for (let sCnt = 0; sCnt < startStr.length; sCnt++) {
                        if (startStr[sCnt] === undefined || endStr[sCnt] === undefined) {
                            if (startStr[sCnt] === undefined) {
                                startStr[sCnt] = endStr[sCnt]
                            } else {
                                endStr[sCnt] = startStr[sCnt]
                            }
                            startStr[sCnt] = startStr[sCnt].replace('.', '')
                            endStr[sCnt] = endStr[sCnt].replace('.', '')
                        }
                    }
                    //console.log(parts)
                    // build dates form string parts
                    const [start, end] = parts.reduce(function (accu, curr) {
                        let date = new Date(curr.join(' '))
                        if (isNaN(date.getTime())) {
                            date = new Date(`${curr[2]}-${curr[1]}-${curr[0]}T00:00:00Z`)
                        }
                        accu.push(date)
                        return accu
                    }, [])
                    //console.log({ start: start.toLocaleDateString(), end: end.toLocaleDateString() })
                    return { start, end }
                } else {
                    // no dates present in title
                    return null
                }
            }
        }
    ]
}
