import { useEffect } from 'react'
import useStore from '../stores/useStore'

export default function useTheme() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      const colors = { light: '#F8F9FA', dark: '#1A1B1E', warm: '#FFF8F0' }
      metaTheme.setAttribute('content', colors[theme] || colors.light)
    }
  }, [theme])

  return theme
}
