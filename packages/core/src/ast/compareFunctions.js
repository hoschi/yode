import * as R from 'ramda'
import * as difflib from 'difflib'

export function getClosestMatchIndex (searchTerm, possibilities) {
    let matcher = new difflib.SequenceMatcher()
    matcher.setSeq2(searchTerm)
    let cutoff = 0.6
    let results = []

    // check identity match first, ratio compution takes time
    let identityMatchIndex = possibilities.findIndex(text => text === searchTerm)
    if (identityMatchIndex >= 0) {
        return identityMatchIndex
    }

    // search for close match
    possibilities.forEach(function (testText, i) {
        matcher.setSeq1(testText)
        if (matcher.realQuickRatio() >= cutoff &&
            matcher.quickRatio() >= cutoff) {
            let score = matcher.ratio()
            if (score >= cutoff) {
                results.push({
                    text: testText,
                    index: i,
                    score: score
                })
            }
        }
    })

    if (results.length <= 0) {
        console.debug('--- no match found', {
            searchTerm,
            possibilities
        })
        // nothing found
        return -1
    }

    // sortBy prop ascending and reverse to have descending sorted results by score
    let sorted = R.sortBy(R.prop('score'), results).reverse()
    let bestMatch = R.head(sorted)
    console.debug('--- match found', {
        searchTerm,
        score: bestMatch.score,
        sorted
    })
    return bestMatch.index
}

export function getFunctionIndexByText (searchTerm, functions) {
    return getClosestMatchIndex(searchTerm, functions.map(f => f.text))
}

export function getFunctionByText (searchTerm, functions) {
    let index = getClosestMatchIndex(searchTerm, functions.map(f => f.text))
    if (index >= 0) {
        return functions[index]
    }
}
