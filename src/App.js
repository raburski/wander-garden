import React from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import './App.css'
import Routes from './routes'
import { setup as setupGoober, styled } from 'goober'
import SideBar from './SideBar'
import { Toaster } from 'react-hot-toast'
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill"

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
  display: flexbox;
  flex: 1;
`

function App() {
  return (
    <AppContainer>
      <Router>
        <SideBar />
        <RoutesContainer>
          <Routes />
        </RoutesContainer>
      </Router>
      <Toaster />
    </AppContainer>
  );
}

export default App;
