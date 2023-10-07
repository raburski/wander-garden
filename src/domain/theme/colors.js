const colors = {
    shadow: {
        light: 'rgba(22, 22, 26, 0.05)',
        dark: 'black',
    },
    border: {
        light: '#F0F0F0',
        normal: '#E0E0E0',
        dark: '#404040',
    },
    neutral: {
        white: '#FFFFFF',
        lightest: '#F0F0F0',
        lighter: '#c0c0c0',
        light: '#878787',
        default: '#3b3b3b',
        dark: '#141414',
        black: '#000000',
    },
    primary: {
        lighter: '#ebf2ee',
        light: '#d5ebe0',
        default: '#4fa177',
        dark: '#215238',
        darker: '#153826',
    }
}

const breakpoints = {
    small: 574,
    medium: 1024,
    large: 1513,
}

export const LIGHT = {
    breakpoints,
    background: {
        default: colors.neutral.white,
        highlight: colors.neutral.lightest,
    },
    primary: {
        default: colors.primary.default,
        highlight: colors.primary.lighter,
        active: colors.primary.light,
    },
    text: colors.neutral.black,
    border: colors.border.normal,
    shadow: colors.shadow.light,
    map: {
        border: colors.neutral.lightest,
        normal: {
            default: colors.neutral.lighter,
            highlight: '#a9a9a9',
        },
        active: {
            default: colors.primary.default,
            highlight: '#67c293',
        },
    }
}

export const DARK = {
    breakpoints,
    background: {
        default: colors.neutral.dark,
        highlight: colors.neutral.default,
    },
    primary: {
        highlight: colors.primary.darker,
        active: colors.primary.dark,
    },
    text: colors.neutral.lightest,
    border: colors.border.dark,
    shadow: colors.shadow.dark,
    map: {
        border: colors.neutral.dark,
        normal: {
            default: colors.neutral.default,
            highlight: colors.neutral.light,
        },
        active: {
            default: colors.primary.dark,
            highlight: colors.primary.default,
        },
    }
}