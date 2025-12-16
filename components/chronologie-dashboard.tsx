"use client"

import { useState } from "react"

import useFetch from "@/hook/useFetch";

import { type F_Chronologie, type B_NewChronologie } from "@/types/chronologie-types"

export function NewChronologie({currentState, elementsLength } : { currentState: number, elementsLength: number}) {
  const [newElement, setNewElement] = useState<B_NewChronologie>({
    name: "",
    from: 0,
    to: 0 
  })

  const { postDatas } = useFetch<B_NewChronologie>()

  function isElementFilled() {
    if ( newElement.name !== "" && newElement.from !== 0 && newElement.to !== 0 ) return true

    return false
  }

  return (
    <li className="chronologie-element-container new-element">
      <span className={`chronologie-element ${currentState === elementsLength ? "chronologie-element-active" : ""}`}></span>

      {
        elementsLength > 0 && <span className="prev-link"></span>
      }

      <div>
        <input 
          className="new-element-name" 
          placeholder="Nouvelle element" 
          value={newElement.name} 
          onChange={(e) => {
            setNewElement((prev) => ({
              ...prev,
              name: e.target.value
            }))
          }}
        />

        <div className="new-element-date-container">
          <input 
            className="new-element-date" 
            style={{ textAlign: "end" }} 
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*" 
            placeholder="XXXX" 
            value={newElement.from} 
            onChange={(e) => {
              // Remove letters or symbols
              const onlyNumbers = e.target.value.replace(/\D/g, "");

              setNewElement((prev) => ({
                ...prev,
                from: Number(onlyNumbers)
              }))
            }}
            /> 

          <span style={{ color: "#fefae0", opacity: ".4"}}>-</span>

          <input 
            className="new-element-date" 
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*" 
            placeholder="XXXX" 
            value={newElement.to} 
            onChange={(e) => {
              // Remove letters or symbols
              const onlyNumbers = e.target.value.replace(/\D/g, "");

              setNewElement((prev) => ({
                ...prev,
                to: Number(onlyNumbers)
              }))
            }}
            /> 
        </div>

        <button 
          className={`new-chronologie-button ${isElementFilled() ? "new-chronologie-button-appear" : ""}`} 
          onClick={() => postDatas(newElement, "/chronologie")}
          >
          Valider
        </button>
      </div>
    </li>
  )
}


// ==============================



export function UpdateChronologie({ element, is_first, setState }: { element: F_Chronologie, is_first: boolean, setState: () => void }) {
  const [updatedElement, setUpdatedElement] = useState(element);

  const { updateData } = useFetch();

  return (
    <li className="chronologie-element-container new-element">
      <span className="chronologie-element chronologie-element-active" style={{ animationName: "unset !important"}}></span>

      {
        !is_first && <span className="prev-link"></span>
      }

      <div>
        <input 
          className="update-element-name" 
          placeholder="Nouvelle element" 
          value={updatedElement.name} 
          onChange={(e) => {
            setUpdatedElement((prev) => ({
              ...prev,
              name: e.target.value
            }))
          }}
          />

        <div className="update-element-date-container">
          <input 
            className="update-element-date" 
            style={{ textAlign: "end" }} 
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*" 
            placeholder="XXXX" 
            value={updatedElement.from} 
            onChange={(e) => {
              // Remove letters or symbols
              const onlyNumbers = e.target.value.replace(/\D/g, "");

              setUpdatedElement((prev) => ({
                ...prev,
                from: Number(onlyNumbers)
              }))
            }}
            /> 

          <span style={{ color: "#fefae0", opacity: ".4"}}>-</span>

          <input 
            className="update-element-date" 
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*" 
            placeholder="XXXX" 
            value={updatedElement.to} 
            onChange={(e) => {
              // Remove letters and symbols
              const onlyNumbers = e.target.value.replace(/\D/g, "");

              setUpdatedElement((prev) => ({
                ...prev,
                to: Number(onlyNumbers)
              }))
            }}
            /> 
        </div>

        <button 
          className="close-chronologie-edit" 
          onClick={() => setState(false)}
        />
        <button 
          className="update-element-button" 
          style={{ opacity: 1 }} 
          onClick={() => updateData(updatedElement, "/chronologie")}
        >
        Valider
        </button>
      </div>
    </li>
  )
}

