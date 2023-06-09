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
import { StaysProvider } from "domain/stays"
import { ThemeProvider, useThemeColors } from "domain/theme"
import { SettingsProvider } from './settings'
import mapboxgl from 'mapbox-gl'
 
mapboxgl.accessToken = 'pk.eyJ1IjoicmFidXJza2kiLCJhIjoiR2ltZ1pkSSJ9.BKiZ33LQkwsLgyyrAw4EyQ';

setupGoober(React.createElement, undefined, useThemeColors)
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
  overflow-y: scroll;
  overflow-x: hidden;
`

const RoutesContainer = styled('div')`
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex: 1;
  justify-content: center;
`

function App() {
  return (
    <Router>
      <SettingsProvider>
        <ThemeProvider>
          <SwarmProvider>
            <HomesProvider>
              <TimelineProvider>
                <StaysProvider>
                  <AppContainer>
                      <SideBar />
                      <RoutesContainer id="routes-container">
                        <Routes />
                      </RoutesContainer>
                    <Toaster />
                  </AppContainer>
                </StaysProvider>
              </TimelineProvider>
            </HomesProvider>
          </SwarmProvider>
        </ThemeProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
