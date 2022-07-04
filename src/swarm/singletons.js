class TokenStorage {
    constructor() {
        this.access_token = null
    }
    set(token) {
        if (!token) {
            localStorage.removeItem('access_token')
            this.access_token = null
        } else {
            localStorage.setItem('access_token', token)
            this.access_token = token
        }
    }
    get() {
        if (!this.access_token) {
            this.access_token =  localStorage.getItem('access_token')
        }
        return this.access_token
    }
    clear() {
        this.set(null)
    }
}

export const _token = new TokenStorage()

function fetchCheckins(untilIDs, offset = 0, limit = 200, accumulatedCheckins = []) {
    const options = { method: 'GET' }
    return fetch(`https://api.foursquare.com/v2/users/self/checkins?v=20220415&oauth_token=${_token.get()}&limit=${limit}&offset=${offset}`, options)
        .then(response => {
            return response.json().then(json => {
                const items = [...json.response.checkins.items]
                const itemWithIDIndex = items.findIndex(checkin => untilIDs.includes(checkin.id))
                const filteredItems = itemWithIDIndex >= 0 ? items.slice(0, itemWithIDIndex) : items
                if (filteredItems.length === 0 || filteredItems.length < items.length) {
                    return [...accumulatedCheckins, ...filteredItems]
                } else {
                    return fetchCheckins(untilIDs, offset + limit, limit, [...accumulatedCheckins, ...filteredItems])
                }
            })
        })
        .catch(err => console.error(err))
}

class SwarmCheckins {
    constructor() {
        this.storeKey = 'swarm_checkins'
        this.cache = JSON.parse(localStorage.getItem(this.storeKey)) || []
    }
    fetch() {
        const checkins = this.get()
        const latestCheckinIDs = [checkins[0], checkins[1], checkins[2]].filter(Boolean).map(c => c.id)
        return fetchCheckins(latestCheckinIDs).then(fetchedCheckins => {
            const newCheckins = [
                ...fetchedCheckins,
                ...checkins,
            ]
            this.set(newCheckins)
        })
    }
    get() {
        return this.cache
    }
    set(checkins = []) {
        this.cache = checkins
        localStorage.setItem(this.storeKey, JSON.stringify(checkins))
    }
}

class YoutubeVideos {
    constructor() {
        this.storeKey = 'youtube_videos'
        this.cache = JSON.parse(localStorage.getItem(this.storeKey)) || []
    }
    get() {
        return this.cache
    }
    set(videos = []) {
        this.cache = videos
        localStorage.setItem(this.storeKey, JSON.stringify(videos))
    }
}

class NetflixMovies {
    constructor() {
        this.storeKey = 'netflix_movies'
        this.cache = JSON.parse(localStorage.getItem(this.storeKey)) || []
    }
    get() {
        return this.cache
    }
    set(movies = []) {
        this.cache = movies
        localStorage.setItem(this.storeKey, JSON.stringify(movies))
    }
}

export const _checkins = new SwarmCheckins()
export const _videos = new YoutubeVideos()
export const _movies = new NetflixMovies()