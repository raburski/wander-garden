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

export const _videos = new YoutubeVideos()
export const _movies = new NetflixMovies()