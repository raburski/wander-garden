declare module "country-flag-emoji" {
    export default {
        get: (code: string) => any
    }
}

declare module 'mapbox-gl';

interface Array<T> {
    last(): T;
    first(): T;
    reversed(): Array<T>;
}