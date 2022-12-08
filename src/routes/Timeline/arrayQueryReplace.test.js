import assert from 'assert'
import arrayQueryReplace, { some, any, start, end } from './arrayQueryReplace'

const queryOne = {
    pattern: [
        e => e == 1,
        e => e == 2,
        e => e == 3
    ],
    result: () => ['resultOne']
}

const queryTwo = {
    pattern: [
        e => e == 2,
        e => e == 2
    ],
    result: ([ e1, e2 ]) => [e1 + e2]
}

const querySome = {
    pattern: [
        e => e == 2,
        some(e => e == 1),
        e => e == 2
    ],
    result: () => 'some'
}

const queryAny = {
    pattern: [
        e => e == 2,
        any(e => e == 1),
        e => e == 2
    ],
    result: () => 'any'
}

const queryStart = {
    pattern: [
        start(e => e == 2),
        e => e == 2
    ],
    result: () => 'start'
}

const queryEnd = {
    pattern: [
        e => e == 2,
        end(e => e == 2)
    ],
    result: () => 'end'
}

const queryStartEnd = {
    pattern: [
        start(e => e == 2),
        some(e => e == 1),
        end(e => e == 2)
    ],
    result: () => 'startend'
}

describe('array match', function () {
    it('should replace with single query provided', function () {
        const array = [3, 2, 1, 1, 2, 3, 2, 2]
        const expectedResult = [3, 2, 1, 'resultOne', 2, 2]
        const result = arrayQueryReplace(queryOne, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should use matched elements in result', function () {
        const array = [3, 2, 1, 1, 2, 3, 2, 2]
        const expectedResult = [3, 2, 1, 1, 2, 3, 4]
        const result = arrayQueryReplace(queryTwo, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should replace with multiple queries provided', function () {
        const array = [3, 2, 1, 1, 2, 3, 2, 2]
        const expectedResult = [3, 2, 1, 'resultOne', 4]
        const result = arrayQueryReplace([queryOne, queryTwo], array)
        assert.deepEqual(result, expectedResult)
    })
    it('should replace with query using some', function () {
        const array = [3, 2, 1, 1, 2, 3, 2, 2]
        const expectedResult = [3, 'some', 3, 2, 2]
        const result = arrayQueryReplace(querySome, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should replace with query using any', function () {
        const array = [3, 2, 1, 1, 2, 3, 2, 2]
        const expectedResult = [3, 'any', 3, 'any']
        const result = arrayQueryReplace(queryAny, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should replace all patterns from query', function () {
        const array = [1, 2, 3, 1, 2, 3]
        const expectedResult = ['resultOne', 'resultOne']
        const result = arrayQueryReplace(queryOne, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should use start expression', function () {
        const array = [2, 2, 2, 2]
        const expectedResult = ['start', 2, 2]
        const result = arrayQueryReplace(queryStart, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should use end expression', function () {
        const array = [2, 2, 2, 2]
        const expectedResult = [2, 2, 'end']
        const result = arrayQueryReplace(queryEnd, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should use start and end expression', function () {
        const array = [2, 1, 1, 2]
        const expectedResult = ['startend']
        const result = arrayQueryReplace(queryStartEnd, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should actually use start and end expression: fail case 1', function () {
        const array = [1, 2, 1, 1, 2]
        const expectedResult = [1, 2, 1, 1, 2]
        const result = arrayQueryReplace(queryStartEnd, array)
        assert.deepEqual(result, expectedResult)
    })
    it('should actually use start and end expression: fail case 2', function () {
        const array = [2, 1, 1, 2, 1, 1]
        const expectedResult = [2, 1, 1, 2, 1, 1]
        const result = arrayQueryReplace(queryStartEnd, array)
        assert.deepEqual(result, expectedResult)
    })
})