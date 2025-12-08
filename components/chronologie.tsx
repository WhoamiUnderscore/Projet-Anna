"use client"

import * as REACT from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"
import ChronologieDashboard from "@/components/chronologie-dashboard"

import { type F_ChronologieElement } from "@/types/chronologie-types"

type Props = {
  elements: F_ChronologieElement[],
  dashboard: boolean
}

export default function Chronologie({ elements, dashboard }: Props) {
  const [currentState, setCurrentState] = REACT.useState(0);


  return <section className="chronologie-page-container">
    <div className="next" onClick={() => {
      let value = () =>  {
        if ( dashboard ) {    
          return currentState < elements.length ? currentState + 1 : currentState;
        }

        return currentState < elements.length - 1 ? currentState + 1 : currentState;
      }
      setCurrentState(value)
    }}></div>
    <div className="previous" onClick={() => {
      let value = currentState > 0 ? currentState - 1 : currentState;
      setCurrentState(value)
    }}></div>

    <ul className="chronologie-container" style={{ width: `calc(100vw * ${elements.length})`, transform: `translateX(calc((-50vw - 50px) * ${currentState} ))`}}>
      {
        elements.map((el, i) => <ChronologieElement key={i} element={el} index={i} currentState={currentState} dashboard={dashboard}/>)
      }
      {
        dashboard && <ChronologieDashboard currentState={currentState} elementsLength={elements.length} />}
    </ul>
  </section>
}

function ChronologieElement({ element, index, currentState, dashboard }: { element: F_ChronologieElement, index: number, currentState: number, dashboard: boolean }) {
  const { deleteData } = useFetch()

  return <li className="chronologie-element-container">
    <span className={`chronologie-element ${currentState === index ? "chronologie-element-active" : ""}`}></span>
    {
      index > 0 && <span className="prev-link"></span>
    }
    <a href={`/${element.name.toLowerCase()}`}>
    <div>
      <p>{element.name}</p>
      <p>{element.from} - {element.to}</p>
    </div>
    </a>

    {
      dashboard && <section className="chronologie-dashboard">
        <span style={{color: ""}}><FontAwesomeIcon icon={faPenToSquare} /></span>        
        <span style={{color: "#d90429"}} onClick={() => deleteData(`/chronologie?id=${element._id}`)}><FontAwesomeIcon icon={faTrash} /></span>        
      </section>
    }
  </li>
}

