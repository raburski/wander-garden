import { useSetting } from "./Context"

export function useOnboardingFinishedSetting() {
    return useSetting('onboarding_finished', false)
}

export function useRunningDemoSetting() {
    return useSetting('running_demo', false)
}

export function useHideSwarmPanelSetting() {
    return useSetting('swarm_panel', false)
}
