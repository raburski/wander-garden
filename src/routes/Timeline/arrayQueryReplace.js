export const EXPRESSION_TYPE = {
    START: 'start',
    END: 'end',
    EXACT: 'exact',
    SOME: 'some',
    ANY: 'any',
}

function isExpression(e) {
    return typeof e === 'function' ? false : Boolean(e.type)
}

export function some(fn) {
    return {
        type: EXPRESSION_TYPE.SOME,
        fn,
    }
}

export function any(fn) {
    return {
        type: EXPRESSION_TYPE.ANY,
        fn,
    }
}

export function exact(fn) {
    return {
        type: EXPRESSION_TYPE.EXACT,
        fn,
    }
}

export function start(fn) {
    return {
        type: EXPRESSION_TYPE.START,
        fn,
    }
}

export function end(fn) {
    return {
        type: EXPRESSION_TYPE.END,
        fn,
    }
}

function normalizePattern(pattern) {
    return pattern.map(e => isExpression(e) ? e : exact(e))
}

function match(pattern, array, currentIndex = 0) {
    if (pattern.length === 0) {
        return currentIndex
    }

    const currentExpression = pattern[0]
    if (array.length === 0) {
        if (pattern.length === 1 && currentExpression.type === EXPRESSION_TYPE.SOME) {
            return currentIndex + 1
        } else {
            return false
        }
    }

    const currentValue = array[0]
    const nextExpression = pattern[1]
    switch (currentExpression.type) {
        case EXPRESSION_TYPE.START:
            if (currentIndex === 0 && currentExpression.fn(currentValue)) {
                return match(pattern.slice(1), array.slice(1), currentIndex + 1)
            } else {
                return false
            }
        case EXPRESSION_TYPE.END:
            if (array.length === 1 && pattern.length === 1 && currentExpression.fn(currentValue)) {
                return match(pattern.slice(1), array.slice(1), currentIndex + 1)
            } else {
                return false
            }
        case EXPRESSION_TYPE.EXACT:
            if (currentExpression.fn(currentValue)) {
                return match(pattern.slice(1), array.slice(1), currentIndex + 1)
            } else {
                return false
            }
        case EXPRESSION_TYPE.ANY:
            if (nextExpression && nextExpression.fn(currentValue)) {
                return match(pattern.slice(2), array.slice(1), currentIndex + 1)
            }
            if (currentExpression.fn(currentValue)) {
                return match(pattern, array.slice(1), currentIndex + 1)
            }
            return false
        case EXPRESSION_TYPE.SOME:
            if (currentExpression.fn(currentValue)) {
                const nextValue = array[1]
                if (!nextValue) {
                    return false
                }
                if (match(pattern.slice(1), array.slice(1), currentIndex + 1)) {
                    return match(pattern.slice(2), array.slice(2), currentIndex + 2)
                }
                return match(pattern, array.slice(1), currentIndex + 1)
            }
            return false
        default:
            return false              
    }
}

export default function arrayQueryReplace(query, initArray) {
    const queryArray = Array.isArray(query) ? query : [query]
    return queryArray.reduce((array, { pattern, result }) => {
        const normalizedPattern = normalizePattern(pattern)
        let resultedArray = array
        let searchIndex = 0
        while(searchIndex < resultedArray.length) {
            const lastIndex = match(normalizedPattern, resultedArray.slice(searchIndex), searchIndex)
            if (lastIndex) {
                const matchedArrayFragment = resultedArray.slice(searchIndex, lastIndex)
                const actualResult = result(matchedArrayFragment)
                const resultArray = Array.isArray(actualResult) ? actualResult : [actualResult]
                resultedArray = [...resultedArray.slice(0, searchIndex), ...resultArray, ...resultedArray.slice(lastIndex)]
                searchIndex = searchIndex + resultArray.length
            } else {
                searchIndex++
            }
        }
        return resultedArray
    }, initArray)
}
