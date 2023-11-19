export function isOptionalOfType(data: any, type: dataCheckFn | string) {
    return isOfType(data, type, true)
}

type dataCheckFn = (data: any) => boolean

export function isOfType(data: any, type: dataCheckFn | string, isOptional: boolean = false) {
    if (typeof type === 'function') {
        return data !== undefined ? type(data) : isOptional
    } else {
        if (type === 'array') {
            return data !== undefined ? Array.isArray(data) : isOptional
        } else {
            return data !== undefined ? typeof data === type : isOptional
        }
    }
}

export function isArrayOfType(array: any[], isItemOfType: (item: any) => boolean) {
    return isOfType(array, 'array') && array.findIndex(item => !isItemOfType(item)) < 0
}

export type Currency = string

export interface Money {
    amount: number
    currency: Currency
}

export function isMoneyType(money?: Money): boolean {
    return money !== undefined
        && isOfType(money.amount, 'number')
        && isOptionalOfType(money.currency, 'string')
}

export enum DataOrigin {
    File = 'FILE',
    Captured = 'CAPTURED',
    UserInput = 'USER_INPUT',
}