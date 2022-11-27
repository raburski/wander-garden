import { Routes, Route, Navigate } from "react-router"
import Swarm from './Swarm'
import Events from './Events'
import Netflix from './Netflix'
import Context from "./Context"
import Timeline from './Timeline'
import Dashboard from './Dashboard'
import AuthenticationFinish from './AuthenticationFinish'

export default function AllRoutes() {
    return (
    <Routes>
        <Route path="swarm" element={<Swarm />}/>
        <Route path="auth" element={<AuthenticationFinish />}/>
        <Route path="netflix" element={<Netflix />}/>
        <Route path="timeline" element={<Timeline />}/>
        <Route path="events" element={<Events />}/>
        <Route path="context" element={<Context />}/>
        <Route path="/" element={<Dashboard />}/>
        <Route path="*" element={<Navigate to="/" />}/>
    </Routes>
    )
}