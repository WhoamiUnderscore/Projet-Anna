"use client"

import * as REACT from "react"

import useFetch from "@/hook/useFetch";

import { type B_NewChronologie } from "@/types/chronologie-types"

export default function ChronologieDashboard({currentState, elementsLength } : { currentState: number, elementsLength: number}) {
  const [newElement, setNewElement] = REACT.useState<B_NewChronologie>({
    name: "",
    from: 0,
    to: 0 
  })

  const { postDatas } = useFetch<B_NewChronologie>()

  function verifyCondition() {
    if ( newElement.name !== "" && newElement.from !== 0 && newElement.to !== 0 ) return true

    return false
  }

  return (
    <li className="chronologie-element-container new-element">
      <span className={`chronologie-element ${currentState === elementsLength ? "chronologie-element-active" : ""}`}></span>
      <span className="prev-link"></span>
      <div>
        <input className="new-element-name" placeholder="Nouvelle element" value={newElement.name} onChange={(e) => {
          setNewElement((prev) => ({
            ...prev,
            name: e.target.value
          }))
        }}/>
        <div className="new-element-date-container">
          <input className="new-element-date" style={{ textAlign: "end" }} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="XXXX" value={newElement.from} onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            setNewElement((prev) => ({
              ...prev,
              from: Number(onlyNumbers)
            }))
          }}/> 
          <span style={{ color: "#fefae0", opacity: ".4"}}>-</span>
          <input className="new-element-date" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="XXXX" value={newElement.to} onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            setNewElement((prev) => ({
              ...prev,
              to: Number(onlyNumbers)
            }))
          }}/> 
        </div>
        <button className={`new-chronologie-button ${verifyCondition() ? "new-chronologie-button-appear" : ""}`} onClick={() => postDatas(newElement, "/chronologie")}>Valider</button>
      </div>
    </li>

  )
}
