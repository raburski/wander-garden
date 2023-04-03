import Segment from "components/Segment"
import { useColorMode } from "domain/theme"
import { ColorTheme } from "domain/theme/types"
import { MdDarkMode, MdWbSunny, MdMonitor } from "react-icons/md"

const ICONS = [MdWbSunny, MdDarkMode, MdMonitor]
const MODES = [ColorTheme.Light, ColorTheme.Dark, ColorTheme.Automatic]

export default function ThemeChange() {
    const [mode, setMode] = useColorMode()
    const selectedIndex = MODES.indexOf(mode)
    function onSelectMode(index) {
        setMode(MODES[index])
    }
    return <Segment icons={ICONS} selectedIndex={selectedIndex} onClick={onSelectMode}/>
}