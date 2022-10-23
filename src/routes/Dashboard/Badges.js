import Panel, { Row } from '../../components/Panel'
import { styled } from 'goober'
import { useCheckIns } from '../../swarm/singletons'
import { onlyUnique } from '../../array'
import colors from '../../colors'
import { onlyNonTransportation } from '../../swarm/categories'

const badges = [
    {
        name: 'Europe',
        emoji: '🏰',
        oneOfCountry: ['al','ad','at','be','ba','bg','hr','cz','dk','fo','fi','fr','de','gi','gr','hu','ie','im','it','je','xk','li','lu','mk','mt','mc','me','nl','no','pl','pt','ro','sm','rs','sk','si','es','se','ch','gb','va'],
    },
    {
        name: 'Post-Soviet',
        emoji: '⚒️',
        oneOfCountry: ['am','az','by','ee','ge','kz','kg','lv','lt','md','ru','tj','tm','ua','uz'], 
    },
    {
        name: 'Middle East',
        emoji: '🕌',
        oneOfCountry: ['af','bh','cy','ir','iq','il','jo','kw','lb','om','pk','ps','qa','sa','sy','tr','ae','ye'], 
    },
    {
        name: 'Asia',
        emoji: '🐲',
        oneOfCountry: ['cn','hk','jp','mo','mn','kp','kr','tw'], 
    },
    {
        name: 'SEA',
        emoji: '🧘',
        oneOfCountry: ['th','ph','bn','kh','tl','id','la','my','mm','ph','sg','th','vn'], 
    },
    {
        name: 'Hindustan',
        emoji: '🐒',
        oneOfCountry: ['bt','in','np','lk'], 
    },
    {
        name: 'North America',
        emoji: '⛰️',
        oneOfCountry: ['ca','pm','us'], 
    },
    {
        name: 'Caribbean',
        emoji: '🌴',
        oneOfCountry: ['ai','ag','aw','bs','bb','bm','vg','ky','cu','cw','dm','do','gd','ht','jm','ms','an','pr','bl','kn','lc','mf','vc','sx','tt','tc','vi','vu'], 
    },
    {
        name: 'Mesoamerica',
        emoji: '🛕',
        oneOfCountry: ['bz','cr','sv','gt','ht','mx','ni','pa'], 
    },
    {
        name: 'Latin America',
        emoji: '💃',
        oneOfCountry: ['ar','bo','br','cl','co','ec','fk','gy','py','pe','sr','uy','ve'], 
    },
    {
        name: 'North Africa',
        emoji: '🐪',
        oneOfCountry: ['al','eg','ly','ml','mr','ma','ni','sn','sd','tn','eh'], 
    },
    {
        name: 'Sub-Saharan',
        emoji: '🦁',
        oneOfCountry: ['ao','bj','bw','bf','bi','cm','cf','td','cd','dj','gq','er','et','ga','gm','gh','gn','gw','ci','ke','ls','lr','mg','mw','mz','na','ng','cg','rw','sl','so','za','ss','sz','tz','tg','ug','zm','zw'], 
    },
    {
        name: 'Oceania',
        emoji: '🌊',
        oneOfCountry: ['as','au','fj','pf','ki','fm','nr','nc','nz','nu','pw','pg','ws','sb','tk','to','tv','wf'], 
    },
    {
        name: 'Cold North',
        emoji: '❄️',
        oneOfCountry: ['fk','is','gl','aq','sj'], 
    },
    {
        name: 'Islander',
        emoji: '🗿',
        oneOfCountry: ['io','cv','cx','cc','km','ck','gu','mv','mh','mu','yt','mp','pn','re','sh','st','sc'], 
    },
]

const BadgeContainer = styled('div')`
    display: flex;
    flex-direction: column;
    padding: 8px;
    margin: 8px;
    align-items: center;
    border-radius: 6px;
    min-width: 72px;
`

const BadgeIcon = styled('div')`
    display: flex;
    font-size: 48px;
`

const BadgeName = styled('div')`
    display: flex;
    font-size: 10px;
`

function Badge({ badge }) {
    const style = badge.acquired ? { backgroundColor: colors.neutral.normal } : { filter: 'grayscale(1)', opacity: 0.6 }
    return (
        <BadgeContainer style={style}>
            <BadgeIcon>{badge.emoji}</BadgeIcon>
            <BadgeName>{badge.name}</BadgeName>
        </BadgeContainer>
    )
}

function createBadgeVerifier(checkins){
    const uniqueCountries = checkins.map(checkin => checkin.venue.location.cc.toLowerCase()).filter(onlyUnique)
    return function verifyBadge(badge) {
        if (badge.oneOfCountry.length === 0) {
            return badge
        }
        if (uniqueCountries.filter(cc => badge.oneOfCountry.includes(cc)).length === 0) {
            return badge
        }
        return {
            ...badge,
            acquired: true,
        }
    }
}

export default function Badges() {
    const checkins = useCheckIns().filter(onlyNonTransportation)
    const verifiedBadges = badges.map(createBadgeVerifier(checkins))
    const contentStyle = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: 520,
        padding: 6,
    }
    return (
        <Panel title="Your regional badges" contentStyle={contentStyle}>
            {verifiedBadges.map(badge => <Badge badge={badge}/>)}
        </Panel>
    )
}