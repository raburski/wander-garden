import React from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import './App.css'
import Routes from './routes'
import { setup as setupGoober, styled } from 'goober'
import SideBar from './SideBar'
import { Toaster } from 'react-hot-toast'
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill"
import { SwarmProvider } from 'domain/swarm'
import { HomesProvider } from "domain/homes"
import { TimelineProvider } from "domain/timeline"
import { ExtensionProvider } from "domain/extension"
import { BookingStaysProvider } from 'domain/bookingcom'
import { AirbnbStaysProvider } from 'domain/airbnb'
import { AgodaStaysProvider } from 'domain/agoda'
import { SettingsProvider } from './settings'
import mapboxgl from 'mapbox-gl'
 
mapboxgl.accessToken = 'pk.eyJ1IjoicmFidXJza2kiLCJhIjoiR2ltZ1pkSSJ9.BKiZ33LQkwsLgyyrAw4EyQ';

setupGoober(React.createElement)
if (/windows/i.test(navigator.userAgent)) {
  polyfillCountryFlagEmojis()
  document.body.classList.add('windows-flags')
}


const AppContainer = styled('div')`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-self: stretch;
  height: 100vh;
  overflow: scroll;
`

const RoutesContainer = styled('div')`
  height: 100vh;
  overflow: scroll;
  display: flex;
  flex: 1;
`

function App() {
  return (
    <SettingsProvider>
      <BookingStaysProvider>
        <AirbnbStaysProvider>
          <AgodaStaysProvider>
            <SwarmProvider>
              <HomesProvider>
                <TimelineProvider>
                  <ExtensionProvider>
                    <AppContainer>
                      <Router>
                        <SideBar />
                        <RoutesContainer>
                          <Routes />
                        </RoutesContainer>
                      </Router>
                      <Toaster />
                    </AppContainer>
                  </ExtensionProvider>
                </TimelineProvider>
              </HomesProvider>
            </SwarmProvider>
          </AgodaStaysProvider>
        </AirbnbStaysProvider>
      </BookingStaysProvider>
    </SettingsProvider>
  );
}

export default App;
