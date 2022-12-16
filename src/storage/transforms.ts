import moment from 'moment'
import { parse, stringify } from 'zipson'
import type { Moment } from "moment"
import type { Transforms } from "./types"

function isJSON(value: any) {
    try {
        JSON.parse(value)
    } catch (e) {
        return false
    }
    return true
}

export const dateTransforms: Transforms<Moment | undefined> = {
    get: value => (!value || value.length <= 0) ? undefined : moment(value),
    set: value => !value ? '' : value.format()
}

export const zipsonTransforms: Transforms<Object> = {
    get: value => isJSON(value) ? JSON.parse(value) : parse(value),
    set: value => stringify(value)
}

export const jsonTransforms: Transforms<Object> = {
    get: value => JSON.parse(value),
    set: value => JSON.stringify(value)
}

export const stringTransforms: Transforms<string | undefined> = {
    get: value => (!value || value.length <= 0) ? undefined : value,
    set: value => value == undefined || value === null ? '' : value
}