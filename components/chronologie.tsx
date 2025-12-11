"use client"

import * as REACT from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"
import { NewChronologie, UpdateChronologie } from "@/components/chronologie-dashboard"

import { type F_ChronologieElement } from "@/types/chronologie-types"

type Props = {
  elements: F_ChronologieElement[],
  dashboard: boolean
}

export default function Chronologie({ elements, dashboard }: Props) {
  const [currentState, setCurrentState] = REACT.useState(0);

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

    <ul className="chronologie-container" style={{ width: `calc(100vw * ${elements.length})`, transform: `translateX(calc((-50vw - 50px) * ${currentState} ))`}}>
      {
        elements.map((el, i) => <ChronologieElement key={i} element={el} index={i} currentState={currentState} dashboard={dashboard}/>)
      }
      {
        dashboard && <NewChronologie currentState={currentState} elementsLength={elements.length} />
      }
    </ul>
  </section>
}

function ChronologieElement({ element, index, currentState, dashboard }: { element: F_ChronologieElement, index: number, currentState: number, dashboard: boolean }) {
  const [updateElement, setUpdateElement] = REACT.useState(false);
  const [deleteElement, setDeleteElement] = REACT.useState(false)
  const { deleteData } = useFetch();

  if ( updateElement ) {
    return <UpdateChronologie element={element} is_first={index === 0} setState={setUpdateElement}/>
  }

  return <li className="chronologie-element-container">
    <span className={`chronologie-element ${currentState === index ? "chronologie-element-active" : ""}`}></span>
    {
      index > 0 && <span className="prev-link"></span>
    }

    {
      !deleteElement && <a href={ dashboard ? `/dashboard/${element.name.toLowerCase()}` : `/${element.name.toLowerCase()}`}>
        <div className="chronologie-info">
          <p>{element.name}</p>
          <p>{element.from} - {element.to}</p>
        </div>
      </a>
    }

    {
      // Delete and Edit button
      !deleteElement && dashboard && <section className="chronologie-dashboard">
        <span style={{color: ""}} onClick={() => setUpdateElement(true)}><FontAwesomeIcon icon={faPenToSquare} /></span>        
        <span style={{color: "#d90429"}} onClick={() => setDeleteElement(true)}><FontAwesomeIcon icon={faTrash} /></span>        
      </section>
    }

    {
      deleteElement && <section className="pop-up-delete-chronologie">
        <p>Est tu sur de vouloir supprimer le mouvement <strong>{element.name}</strong> ?</p>

        <div className="pop-up-button-container">
          <button className="delete-button" onClick={() => deleteData(`/chronologie?id=${element._id}`)}>Supprimer</button>
          <button className="return-button" onClick={() => setDeleteElement(false)}>Annuler</button>
        </div>
      </section>
    }
  </li>
}

