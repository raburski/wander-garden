import { useVisitedCountryCodes } from "domain/visitedCountries"
import createBadgeVerifier from "./verifier"

export const religionBadgeRules = [
    {
        name: 'Catholic',
        emoji: '✝️',
        oneOfCountry: ['va','tl','sm','py','ad','mt','mc','gq','pt','hr','ph','cv','lt','sc','li','it','mx','pe','st','sk','pl','co','bo','ec','ie','ve','lu','bi','lc','dm','ki','sk','pa','ht','es','fm','at','cu','br','ga','ar','do','cr','fr','pw','ls','gd','be','rw','gt','cl','ao','bz','ni','ug','sv','cm','uy','cd','hn','ch','cg','hu'],
    },
    {
        name: 'Protestant',
        emoji: '✝️',
        oneOfCountry: ['tv','dk','vc','mh','sb','lr','na','kn','to','za','no','bs','is','ag','zm','bb','zw','bw','nr','fi','pg','cf','ke','jm','se','gh','mw','cg','ls','ws','cd','us','ug','rw','fj','hn','ki','vu','ga','gt','gy','mg','tz','tt','ng','lv','pr','gb'],
    },
    {
        name: 'Orthodox',
        emoji: '☦️',
        oneOfCountry: ['md','gr','cy','rs','me','ge','by','ro','mk','ua','bg','ru','ba'], 
    },
    {
        name: 'Islam',
        emoji: '☪️',
        oneOfCountry: ['mr','so','af','ir','eh','dz','ma','mv','km','ne','tj','tn','ps','az','jo','sn','ye','dj','ly','yt','pk','gm','sa','sd','xk','iq','ml','tm','bd','eg','gn','tr','uz','id','om','sy','bn','kg','cc','sl','qa','kw','bh','ae','kz','lb','bf','my','al','td','ba','ng','gw','ci','er','tz','mk'], 
    },
    {
        name: 'Judaism',
        emoji: '✡️',
        oneOfCountry: ['il'], 
    },
    {
        name: 'Taoism',
        emoji: '☯️',
        oneOfCountry: ['tw','hk','sg'], 
    },
    {
        name: 'Hinduism',
        emoji: '🕉️',
        oneOfCountry: ['np','in','mu','fj','gy','bt','sr'], 
    },
    {
        name: 'Buddism',
        emoji: '☸️',
        oneOfCountry: ['kh','th','mm','bt','lk','la','mn','jp','sg'], 
    },
]

export function useReligionBadges() {
    const visitedCountryCodes = useVisitedCountryCodes()
    return religionBadgeRules.map(createBadgeVerifier(visitedCountryCodes))
}