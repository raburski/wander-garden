import { useEffect, useState } from "react"
import Page from "../components/Page"
import InfoPanel from "../components/InfoPanel"
import SquareImage from '../components/SquareImage'
import { QRCodeSVG } from 'qrcode.react'

function useLocalAddress() {
    const [host, setHost] = useState()
    useEffect(() => {
        const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

        if (RTCPeerConnection) {
            var rtc = new RTCPeerConnection({iceServers:[]});
            if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
                rtc.createDataChannel('', {reliable:false});
            };
            
            rtc.onicecandidate = function (evt) {
                // convert the candidate to SDP so we can run it through our general parser
                // see https://twitter.com/lancestout/status/525796175425720320 for details
                if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
            };
            rtc.createOffer(function (offerDesc) {
                grepSDP(offerDesc.sdp);
                rtc.setLocalDescription(offerDesc);
            }, function (e) { console.warn("offer failed", e); });
            
            
            var addrs = Object.create(null);
            addrs["0.0.0.0"] = false;
            function updateDisplay(newAddr) {
                setHost(newAddr)
                // if (newAddr in addrs) return;
                // else addrs[newAddr] = true;
                // var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
                // console.log(displayAddrs.join(" or perhaps ") || "n/a")
                // document.getElementById('list').textContent = displayAddrs.join(" or perhaps ") || "n/a";
            }
            
            function grepSDP(sdp) {
                var hosts = [];
                sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
                    if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                        var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                            addr = parts[4],
                            type = parts[7];
                        if (type === 'host') updateDisplay(addr);
                    } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                        var parts = line.split(' '),
                            addr = parts[2];
                        updateDisplay(addr);
                    }
                });
            }
        }
    })
    return host
}

const LOCALHOST = 'http://127.0.0.1:3000'
export default function Phone() {
    const host = useLocalAddress()
    const websiteDomain = window.document.location.origin
    const qrValue = websiteDomain === LOCALHOST ? `http://${host}:3000/phone-connect?address=${host}` : `${websiteDomain}/phone-connect?address=${host}`
    return (
        <Page header="Phone">
            <InfoPanel spacing header="Open your garden on mobile" image={<QRCodeSVG value={qrValue} />}>
                You should be able to use the QR-code link to open this website in mobile mode.
                <br/>You can then import your photo metadata into your garden!
                <br/><br/>DOES NOT WORK, STILL WIP!
            </InfoPanel>
            
        </Page>
    )
}