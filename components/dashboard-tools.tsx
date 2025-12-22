"use client"

import { useState, forwardRef, useRef } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"

import { type DashboardElementState } from "@/types/dashboard-types"
import { type F_ChronologieElement } from "@/types/chronologie-types"
import { type F_Article } from "@/types/article-types"
import { type F_Artiste } from "@/types/artiste-types"
import { type F_Cour } from "@/types/cour-types"

type Props = {
  element: F_ChronologieElement | F_Cour | F_Artiste | F_Article,
  state: DashboardElementState,
  toggleView: (view: DashboardElementState) => void,
}

const DashboardTools = forwardRef<HTMLLinkElement, Props>(
  ({ element, state, toggleView }, ref) => { 
  const [isDeleting, setIsDeleting] = useState<boolean>(state === "delete")

  const buttonsRef = useRef<HTMLDivElement>(null)

  const { deleteData } = useFetch();


  function prepareDeletion() {
    let type: "article" | "chronologie" | "cour" | "artiste";

    if ( "metier" in element ) {
      type = "artiste"
    } else if ( "mouvement" in element ) {
      type = "article"
    } else if ( "subject" in element ) {
      type = "cour"
    } else {
      type = "chronologie"
    }

    deleteData(`/${type}?id=${element._id}`)
  }

  const handleDisableDeletion = () => toggleView("view")
  const handleDeleteClick = () => toggleView("delete")
  const handleUpdateClick = () => {
    if ( ref && typeof ref !== "function" && ref.current ) {
      ref.current.style.opacity = "0";
    }

    if ( buttonsRef && buttonsRef.current ) {
      buttonsRef.current.style.opacity = "0";
    }

    const time = setTimeout(() => {
      toggleView("edit")
    }, 800);
  }

  return (
    <section className="chronologie-dashboard">
    {
      state === "delete" ?
        // Buttons
        <section className="pop-up-delete-chronologie">
          <p>Est tu sur de vouloir supprimer le mouvement <strong>{"name" in element ? element.name : element.title}</strong> ?</p>

          <div className="pop-up-button-container">
            <button className="delete-button" onClick={prepareDeletion}>Supprimer</button>
            <button className="return-button" onClick={handleDisableDeletion}>Annuler</button> 
          </div>
        </section>
        :
        // Prevent delete pop-up
        <div className="buttons-container" ref={buttonsRef}>
          <span style={{color: ""}} onClick={handleUpdateClick}><FontAwesomeIcon icon={faPenToSquare} /></span>        
          <span style={{color: "#d90429"}} onClick={handleDeleteClick}><FontAwesomeIcon icon={faTrash} /></span>        
        </div>
    }
    </section>
  )
})

export default DashboardTools
