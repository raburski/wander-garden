import { Routes, Route, Navigate } from "react-router"
import Swarm from './Swarm'
import Data from './Data'
import Netflix from './Netflix'
import Context from "./Context"
import Timeline from './Timeline'
import Badges from './Badges'
import Dashboard from './Dashboard'
import Phone from './Phone'
import PhoneConnect from './PhoneConnect'
import AuthenticationFinish from './AuthenticationFinish'
import About from "./About"
import Map from './Map'
import Stays from './Extension'
import Trip from './Trip'
import Settings from "./Settings"

export default function AllRoutes() {
    return (
    <Routes>
        <Route path="swarm" element={<Swarm />}/>
        <Route path="stays" element={<Stays />}/>
        <Route path="auth" element={<AuthenticationFinish />}/>
        <Route path="netflix" element={<Netflix />}/>
        <Route path="phone" element={<Phone />}/>
        <Route path="phone-connect" element={<PhoneConnect />}/>
        <Route path="timeline" element={<Timeline />}/>
        <Route path="timeline/:id" element={<Trip />}/>
        <Route path="badges" element={<Badges />}/>
        <Route path="data" element={<Data />}/>
        <Route path="context" element={<Context />}/>
        <Route path="map" element={<Map />}/>
        <Route path="info" element={<About />}/>
        <Route path="settings" element={<Settings />}/>
        <Route path="/" element={<Dashboard />}/>
        <Route path="*" element={<Navigate to="/" />}/>
    </Routes>
    )
}