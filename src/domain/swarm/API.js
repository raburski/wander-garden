export const UnauthorizedError = new Error('Unauthorized')

export function fetchCheckins(token, untilIDs, offset = 0, limit = 200, accumulatedCheckins = []) {
    const options = { method: 'GET' }
    return fetch(`https://api.foursquare.com/v2/users/self/checkins?v=20220415&oauth_token=${token}&limit=${limit}&offset=${offset}`, options)
        .then(response => {
            return response.json().then(json => {
                if (json.meta && json.meta.code === 401) {
                    throw UnauthorizedError
                }
                const items = [...json.response.checkins.items]
                const itemWithIDIndex = items.findIndex(checkin => untilIDs.includes(checkin.id))
                const filteredItems = itemWithIDIndex >= 0 ? items.slice(0, itemWithIDIndex) : items
                if (filteredItems.length === 0 || filteredItems.length < items.length) {
                    return [...accumulatedCheckins, ...filteredItems]
                } else {
                    return fetchCheckins(token, untilIDs, offset + limit, limit, [...accumulatedCheckins, ...filteredItems])
                }
            })
        })
}
