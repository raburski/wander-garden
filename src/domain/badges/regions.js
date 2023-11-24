import { useVisitedCountryCodes } from "domain/visitedCountries"
import createBadgeVerifier from "./verifier"

export const regionalBadgeRules = [
    {
        name: 'Europe',
        emoji: '🏰',
        oneOfCountry: ['al','ad','at','be','ba','bg','hr','cz','cy','dk','fo','fi','fr','de','gi','gr','hu','ie','im','it','je','xk','li','lu','mk','mt','mc','me','nl','no','pl','pt','ro','sm','rs','sk','si','es','se','ch','gb','va'],
    },
    {
        name: 'Post-Soviet',
        emoji: '⚒️',
        oneOfCountry: ['am','az','by','ee','ge','kz','kg','lv','lt','md','ru','tj','tm','ua','uz'], 
    },
    {
        name: 'Middle East',
        emoji: '🕌',
        oneOfCountry: ['af','bh','ir','iq','il','jo','kw','lb','om','pk','ps','qa','sa','sy','tr','ae','ye'], 
    },
    {
        name: 'Asia',
        emoji: '🐲',
        oneOfCountry: ['cn','hk','jp','mo','mn','kp','kr','tw'], 
    },
    {
        name: 'SEA',
        emoji: '🧘',
        oneOfCountry: ['bn','kh','tl','id','la','my','mm','ph','sg','th','vn'], 
    },
    {
        name: 'Hindustan',
        emoji: '🐒',
        oneOfCountry: ['bt','in','np','lk'], 
    },
    {
        name: 'North America',
        emoji: '⛰️',
        oneOfCountry: ['ca','us'], 
    },
    {
        name: 'Caribbean',
        emoji: '🌴',
        oneOfCountry: ['ai','ag','aw','bs','bb','bm','vg','ky','cu','cw','dm','do','gd','ht','jm','ms','pr','bl','kn','lc','mf','vc','sx','tt','tc','vi'], 
    },
    {
        name: 'Mesoamerica',
        emoji: '🛕',
        oneOfCountry: ['bz','cr','sv','gt','hn','mx','ni','pa'], 
    },
    {
        name: 'Latin America',
        emoji: '💃',
        oneOfCountry: ['ar','bo','br','cl','co','ec','fk','gy','py','pe','sr','uy','ve'], 
    },
    {
        name: 'North Africa',
        emoji: '🐪',
        oneOfCountry: ['dz','eg','ly','ml','mr','ma','ni','sn','sd','tn','eh'], 
    },
    {
        name: 'Sub-Saharan',
        emoji: '🦁',
        oneOfCountry: ['ao','bj','bw','bf','bi','cm','cf','td','cd','dj','gq','er','et','ga','gm','gh','gn','gw','ci','ke','ls','lr','mg','mw','mz','na','ng','cg','rw','sl','so','za','ss','sz','tz','tg','ug','zm','zw'], 
    },
    {
        name: 'Oceania',
        emoji: '🌊',
        oneOfCountry: ['as','au','fj','pf','ki','fm','nr','nc','nz','nu','pw','pg','ws','sb','tk','to','tv','wf','vu'], 
    },
    {
        name: 'Cold North',
        emoji: '❄️',
        oneOfCountry: ['fk','is','gl','aq','sj'], 
    },
    {
        name: 'Islander',
        emoji: '🗿',
        oneOfCountry: ['io','cv','cx','cc','km','ck','gu','mv','mh','mu','yt','mp','pn','re','sh','st','sc','pm'], 
    },
]

export function getRegionEmojiForCountry(cc) {
    const lowerCC = cc.toLowerCase()
    return regionalBadgeRules.find(rule => rule.oneOfCountry.includes(lowerCC))?.emoji
}

export function useRegionalBadges() {
    const visitedCountryCodes = useVisitedCountryCodes()
    return regionalBadgeRules.map(createBadgeVerifier(visitedCountryCodes))
}