export function isDEV(): Boolean {
    return process.env.NODE_ENV == 'development'
}
