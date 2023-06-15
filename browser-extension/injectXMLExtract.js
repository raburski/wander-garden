function monkeyPatch() {
    console.log("Injecting Wander Garden secateur.");
    let oldXHROpen = window.XMLHttpRequest.prototype.open
    window.XMLHttpRequest.prototype.open = function() {
        this.addEventListener("load", function() {
            const isText = this.responseType === '' || this.responseType === 'text'
            const responseBody = isText ? this.responseText : this.response
            window.postMessage({
                target: '*',
                type: 'response_captured',
                url: this.responseURL,
                body: responseBody,
            }, '*')
        })
        return oldXHROpen.apply(this, arguments)
    }
}

monkeyPatch()