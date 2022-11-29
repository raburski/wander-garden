import moment from 'moment'
import { parse, stringify } from 'zipson'

function isJSON(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

export const dateTransforms = {
    get: value => (!value || value.length <= 0) ? null : moment(value),
    set: value => !value ? '' : value.format()
}

export const jsonTransforms = {
    get: value => isJSON(value) ? JSON.parse(value) : parse(value),
    set: value => stringify(value)
}

export const stringTransforms = {
    get: value => (!value || value.length <= 0) ? null : value,
    set: value => value == null ? '' : value
}