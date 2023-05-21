import { useLocation, useOutlet } from "@remix-run/react"
import { useRef, useState } from "react"
import { SwitchTransition, CSSTransition } from "react-transition-group"

function AnimatedOutlet() {
  const [outlet] = useState(useOutlet())

  return outlet
}

export default function Example() {
  const location = useLocation()
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <SwitchTransition>
        <CSSTransition
          key={location.pathname}
          timeout={100}
          nodeRef={nodeRef}
          classNames={{
            enter: "opacity-0",
            enterActive: "opacity-100",
            exitActive: "opacity-0",
          }}
        >
          <div ref={nodeRef} className="transition-all duration-300">
            <AnimatedOutlet />
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}
