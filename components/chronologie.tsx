"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"
import { NewChronologie, UpdateChronologie } from "@/components/chronologie-dashboard"
import DashboardTools from "@/components/dashboard-tools"

import { type F_ChronologieElement } from "@/types/chronologie-types"
import { type DashboardElementState } from "@/types/dashboard-types"

type Props = {
  elements: F_ChronologieElement[],
  dashboard: boolean
}

export default function Chronologie({ elements, dashboard }: Props) {
  const [currentState, setCurrentState] = useState(0);

  function moveChronologie(prev: boolean) {
    let value = 0;

    if ( !prev ) {
      if ( dashboard ) {    
        value = currentState < elements.length ? currentState + 1 : currentState;
      } else {
        value = currentState < elements.length - 1 ? currentState + 1 : currentState;
      }
    } else {
      value = currentState > 0 ? currentState - 1 : currentState;
    }

    setCurrentState(value)
  }

  return <section className="chronologie-page-container">
    <div className="next" onClick={() => moveChronologie(false)}></div>
    <div className="previous" onClick={() => moveChronologie(true)}></div>

    <ul 
      className="chronologie-container" 
      style={{ 
        width: `calc(100vw * ${elements.length == 0 ? 1 : elements.length})`, 
        transform: `translateX(calc((-50vw - 50px) * ${currentState} ))`}}
      >
      {
        elements.map((e, i) => <ChronologieElement key={i} element={e} index={i} currentState={currentState} dashboard={dashboard}/>)
      }

      {
        // If dashboard is activate -> add new chronologie component
        dashboard && <NewChronologie currentState={currentState} elementsLength={elements.length} />
      }
    </ul>
  </section>
}



// ======================================================



function ChronologieElement({ 
  element, 
  index, 
  currentState, 
  dashboard 
}: { 
  element: F_ChronologieElement, 
  index: number, 
  currentState: number, 
  dashboard: boolean 
}) {
  const [elementState, setElementState] = useState<DashboardElementState>("view")
  const textRef = useRef<HTMLAnchorElement>(null)

  const isDashboardLink = `${dashboard ? "/dashboard" : ""}/mouvements/${element.name.toLowerCase()}`
  const toggleView = (view: DashboardElementState) => setElementState(view);

  useEffect(() => {
    if ( !textRef || !textRef.current ) return

    function handleTransitionEnd(event: TransitionEvent) {
      const el = event.target as HTMLAnchorElement;
      el.style.setProperty("display", "none");
    }

    textRef.current.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      textRef.current?.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [textRef])

  useEffect(() => {
    if ( elementState === "view" && textRef && textRef.current ) {
      const timeout = setTimeout(() => {
        if ( !textRef || !textRef.current ) return
          
        textRef.current.style.display = "flex";
        textRef.current.style.opacity = "1";
      }, 490)
    }
  }, [elementState, textRef])

  return (
    <li className="chronologie-element-container">
      <Link 
        href={isDashboardLink} 
        className={`chronologie-element ${currentState === index ? "chronologie-element-active" : ""}`}
      >
      </Link>

      {
        index > 0 && <span className="prev-link"></span>
      }

      <Link 
        href={isDashboardLink} 
        ref={textRef}
      >
        <div className="chronologie-info">
          <p>{element.name}</p>
          <p>{element.from} - {element.to}</p>
        </div>
      </Link>

      <UpdateChronologie 
        element={element} 
        is_first={index === 0} 
        toggleView={toggleView} 
        enable={elementState === "edit"}
      />


      {
        dashboard && elementState !== "edit" && 
          <DashboardTools 
            toggleView={toggleView} 
            state={elementState} 
            element={element} 
            ref={textRef}
          />
    }
    </li>
  )
}
