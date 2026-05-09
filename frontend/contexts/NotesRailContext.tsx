"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export type PointOnTimeline = {
  id: string
  text: string
  tabSlug: string
  tabLabel: string
}

type NotesRailContextValue = {
  collapsed: boolean
  setCollapsed: (next: boolean) => void
  /** Count of workspace points with `target_date` per ISO day (drives notes timeline badges). */
  pointDateHints: Record<string, number>
  setPointDateHints: React.Dispatch<React.SetStateAction<Record<string, number>>>
  /** Workspace points linked to each calendar day (for timeline summary popup). */
  pointDetailsByIso: Record<string, PointOnTimeline[]>
  setPointDetailsByIso: React.Dispatch<React.SetStateAction<Record<string, PointOnTimeline[]>>>
  /** Focus the notes rail on a calendar day (yyyy-mm-dd). */
  selectNotesIso: (iso: string) => void
  registerSelectNotesIso: (fn: ((iso: string) => void) | null) => void
}

const NotesRailContext = React.createContext<NotesRailContextValue | null>(null)

export function NotesRailProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [pointDateHints, setPointDateHints] = React.useState<Record<string, number>>({})
  const [pointDetailsByIso, setPointDetailsByIso] = React.useState<Record<string, PointOnTimeline[]>>({})
  const selectNotesHandlerRef = React.useRef<((iso: string) => void) | null>(null)

  React.useEffect(() => {
    setCollapsed(false)
  }, [pathname])

  const registerSelectNotesIso = React.useCallback((fn: ((iso: string) => void) | null) => {
    selectNotesHandlerRef.current = fn
  }, [])

  const selectNotesIso = React.useCallback((iso: string) => {
    selectNotesHandlerRef.current?.(iso)
  }, [])

  const value = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      pointDateHints,
      setPointDateHints,
      pointDetailsByIso,
      setPointDetailsByIso,
      selectNotesIso,
      registerSelectNotesIso,
    }),
    [collapsed, pointDateHints, pointDetailsByIso, registerSelectNotesIso, selectNotesIso]
  )

  return <NotesRailContext.Provider value={value}>{children}</NotesRailContext.Provider>
}

export function useNotesRail(): NotesRailContextValue {
  const ctx = React.useContext(NotesRailContext)
  if (!ctx) {
    return {
      collapsed: false,
      setCollapsed: () => {},
      pointDateHints: {},
      setPointDateHints: () => {},
      pointDetailsByIso: {},
      setPointDetailsByIso: () => {},
      selectNotesIso: () => {},
      registerSelectNotesIso: () => {},
    }
  }
  return ctx
}
