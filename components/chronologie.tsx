"use client"

import * as REACT from "react"

import { type F_ChronologieElement } from "@/types/chronologie-types"

type Props = {
  elements: F_ChronologieElement[]
}

export default function Chronologie({ elements }: Props) {
  const [currentState, setCurrentState] = REACT.useState(0);

  return <section className="chronologie-page-container">
    <div className="next" onClick={() => {
      let value = currentState < elements.length-1 ? currentState + 1 : currentState;
      setCurrentState(value)
    }}></div>
    <div className="previous" onClick={() => {
      let value = currentState > 0 ? currentState - 1 : currentState;
      setCurrentState(value)
    }}></div>

    <ul className="chronologie-element-container" style={{ width: `calc(100vw * ${elements.length})`, transform: `translateX(calc((-50vw - 50px) * ${currentState} ))`}}>
      {
        elements.map((el, i) => <ChronologieElement key={i} element={el} index={i} currentState={currentState} />)
      }
    </ul>
  </section>
}

function ChronologieElement({ element, index, currentState }: { element: F_ChronologieElement, index: number, currentState: number }) {
  
  return <li className={`chronologie-element ${currentState === index ? "chronologie-element-active" : ""}`}>
    <a href={`/${element.name.toLowerCase()}`}>
    {
      index > 0 && <span className="prev-link"></span>
    }
    <div>
      <p>{element.name}</p>
      <p>{element.from} - {element.to}</p>
    </div>
    </a>
  </li>
}
