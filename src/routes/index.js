import { Routes, Route, Navigate } from "react-router"
import Swarm from './Swarm'
import Events from './Events'
import Netflix from './Netflix'
import Context from "./Context"
import Timeline from './Timeline'

export default function AllRoutes() {
    return (
    <Routes>
        <Route path="swarm" element={<Swarm />}/>
        <Route path="auth" element={<Swarm />}/>
        <Route path="netflix" element={<Netflix />}/>
        <Route path="timeline" element={<Timeline />}/>
        <Route path="events" element={<Events />}/>
        <Route path="context" element={<Context />}/>
        <Route path="/" element={<Timeline />}/>
        <Route path="*" element={<Navigate to="/" />}/>
    </Routes>
    )
}