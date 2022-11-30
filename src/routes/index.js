import { Routes, Route, Navigate } from "react-router"
import Swarm from './Swarm'
import Events from './Events'
import Netflix from './Netflix'
import Context from "./Context"
import Timeline from './Timeline'
import Dashboard from './Dashboard'
import Phone from './Phone'
import PhoneConnect from './PhoneConnect'
import AuthenticationFinish from './AuthenticationFinish'
import WebsiteInfo from "./WebsiteInfo"

export default function AllRoutes() {
    return (
    <Routes>
        <Route path="swarm" element={<Swarm />}/>
        <Route path="auth" element={<AuthenticationFinish />}/>
        <Route path="netflix" element={<Netflix />}/>
        <Route path="phone" element={<Phone />}/>
        <Route path="phone-connect" element={<PhoneConnect />}/>
        <Route path="timeline" element={<Timeline />}/>
        <Route path="events" element={<Events />}/>
        <Route path="context" element={<Context />}/>
        <Route path="info" element={<WebsiteInfo />}/>
        <Route path="/" element={<Dashboard />}/>
        <Route path="*" element={<Navigate to="/" />}/>
    </Routes>
    )
}