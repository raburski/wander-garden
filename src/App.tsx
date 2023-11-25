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
import { StaysProvider } from "domain/stays"
import { ThemeProvider, useThemeColors } from "domain/theme"
import { MapProvider } from "domain/map"
import { OnboardingProvider } from "domain/onboarding"
import { SettingsProvider } from './domain/settings'
import { Analytics } from '@vercel/analytics/react'
import mapboxgl from 'mapbox-gl'
import { InstagramProvider } from "domain/instagram"
import { TripsProvider } from "domain/trips"
import { TitlesProvider } from "domain/titles"
import { ExtensionProvider } from "domain/extension"
import { ToursProvider } from "domain/tours"
import { VersionProvider } from "domain/version"
import { NotesProvider } from "domain/notes"
import { StatsProvider } from "domain/stats"
import ModalsProvider from "domain/modals"
 
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
  overflow: hidden;
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
      <MapProvider>
      <SettingsProvider>
        <ThemeProvider>
          <ExtensionProvider>
          <TitlesProvider>
        <HomesProvider>
          
          <TripsProvider>
        <ToursProvider>
          <SwarmProvider>
            <InstagramProvider>
              
                <StaysProvider>
                  <StatsProvider>
                  <VersionProvider>
                    <NotesProvider>
                  <AppContainer>
                      <Analytics />
                      <ModalsProvider>
                      <OnboardingProvider>
                      
                        <SideBar />
                        <RoutesContainer id="routes-container">
                          <Routes />
                        </RoutesContainer>
                      </OnboardingProvider>
                      </ModalsProvider>
                    <Toaster />
                  </AppContainer>
                  </NotesProvider>
                  </VersionProvider>
                  </StatsProvider>
                </StaysProvider>
              
            </InstagramProvider>
          </SwarmProvider>
          </ToursProvider>
          </TripsProvider>
          
          </HomesProvider>
          </TitlesProvider>
          </ExtensionProvider>
        </ThemeProvider>
      </SettingsProvider>
      </MapProvider>
    </Router>
  )
}

export default App;
