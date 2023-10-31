function monkeyPatchLocation() {
    console.log("Injecting Wander Garden secateur. LOCATION");
    window.location.replace = function(url) {
        console.log('REPLACE', url)
    }
}

monkeyPatchLocation()