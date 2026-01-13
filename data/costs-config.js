module.exports = {
    sheetName: 'Kostenzusammenstellung ',
    type: 'object',
    fields: [
        {
            key: 'matchcode',
            row: 1,
            column: 1,
            parser: function (cell) {
                //console.log(cell.worksheet.workbook)
                const matcher = /\w*\s*[\wÄÖÜäöü]*\s*\d{2,4}\w*/
                const dateMatcher = /(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?/
                const timeFrame = /(vom\s)?\d{1,2}\.?((\s?\-\s?)|(\s?bis\s?))\d{1,2}\.\d{1,2}\.\d{1,4}/
                const matches = matcher.exec(cell.text)
                const dMatches = dateMatcher.exec(cell.text)
                console.log(matches)
                console.log(dMatches)
                return cell.text
            }
        }
    ]
}
