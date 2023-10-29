function convertGPSCoordinates(gpsCoordinates) {
    // Extract latitude and longitude components from the input string
    const regex = /([NS]) (\d+)° (\d+\.\d+), ([EW]) (\d+)° (\d+\.\d+)/;
    const match = gpsCoordinates.match(regex);
  
    // Check if the input string matches the expected format
    if (!match) {
      return undefined
    }
  
    // Extract the relevant components from the regex match
    const latitudeDirection = match[1];
    const latitudeDegrees = Number(match[2]);
    const latitudeMinutes = Number(match[3]);
    const longitudeDirection = match[4];
    const longitudeDegrees = Number(match[5]);
    const longitudeMinutes = Number(match[6]);
  
    // Convert degrees and minutes to decimal degrees
    const latitudeDecimal = latitudeDegrees + latitudeMinutes / 60;
    const longitudeDecimal = longitudeDegrees + longitudeMinutes / 60;
  
    // Determine the sign of the latitude and longitude based on the direction
    const latitude = latitudeDirection === "N" ? latitudeDecimal : -latitudeDecimal;
    const longitude = longitudeDirection === "E" ? longitudeDecimal : -longitudeDecimal;
  
    // Return the latitude and longitude as an object
    return { latitude, longitude }
}

function isPotentialPostcode(string) {
    const genericPattern = /^[0-9A-Z\s-]+$/
    return genericPattern.test(string)
}

function getAddressComponents(string) {
    const parts = string.split(',').map(s => s.trim()).filter(s => !isPotentialPostcode(s))
    const country = parts.pop()
    const city = parts.pop().split(' ').filter(s => !isPotentialPostcode(s)).join(' ')
    const address = parts.join(', ')

    return {
        address,
        city,
        country,
    }
}