"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ScrollToTop() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={[
        "fixed bottom-5 end-5 z-50 transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      ].join(" ")}
    >
      <Button
        type="button"
        variant="secondary"
        size="icon-lg"
        className="shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Go to top"
      >
        <ArrowUp className="size-4" />
      </Button>
    </div>
  )
}

