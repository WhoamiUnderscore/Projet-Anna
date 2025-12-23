"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"
import DashboardTools from "@/components/dashboard-tools"

import { type F_Cour, type F_NewCour } from "@/types/cour-types"
import { type DashboardElementState } from "@/types/dashboard-types"

export function CourComponent({ cour }: { cour: F_Cour }) {
  return (
    <Link href={`/autres/${cour._id}`} className="cour-container">
      <div className="image-container">
        <img src={cour.image} alt="image de cour non charger" />
      </div>

      <section className="cour-informations">
        <h3>{cour.title}</h3>
        <p>{cour.subject}</p>
      </section>
    </Link>
  )
}



export function CourDashboardComponent({ cour }: { cour: F_Cour }) {
  const [elementState, setElementState] = useState<DashboardElementState>("view")

  const toggleView = (view: DashboardElementState) => setElementState(view);

  return <section className="cour-container">
    <Link 
      href={`/dashboard/autres/${cour._id}`} 
      className="image-container" 
      style={{ pointerEvents: "all"}}
    >
      <img className="cour-image" src={cour.image} />
    </Link>

    <Link
      href={`/dashboard/autres/${cour._id}`} 
      className="cour-information-container"
    >
      <h3>{cour.title}</h3>
      <p>{cour.subject}</p>
    </Link>

    <CourForm 
      enable={elementState === "edit"}
      toggleView={toggleView}
      default_value={{
        ...cour,
        image_preview: cour.image
      } as F_NewCour} 
    />

    {
      elementState !== "edit" && 
        <DashboardTools 
          toggleView={toggleView} 
          state={elementState} 
          element={cour} 
        />
    }
    </section>
}





export function CourForm({ 
  enable = true,
  toggleView,
  default_value = {
    title: "",
    subject: "",
    image: "",
    image_preview: "",
    content: ""
  }
}: { 
  enable?: boolean,
  toggleView?: (view: DashboardElementState) => void,
  default_value?: F_NewCour 
}) {
  const [courForm, setCourForm] = useState<F_NewCour>(default_value)

  const { loading, postDatas, updateData } = useFetch()
  
  function isCourFilled() {
    const { title, subject, image, content } = courForm;

    return title !== "" && subject !== "" && image !== "" 
  }

  function handleSave() {
    const { title, subject, image, content } = courForm;

    let valid_data: F_NewCour = {
      title, 
      subject,
      image,
      content
    };

    if ( courForm._id ) {
      valid_data._id = courForm._id

      updateData<F_NewCour>(valid_data, "/cours")
    } else {
      postDatas<F_NewCour>(valid_data, "/cours")
    }
  }

  return (
    <article 
      className="cour-container"
      style={
          !toggleView ? // Is not an editable article 
            { } :
            enable ?
              { position: "absolute", display: "flex" } :
              { display: "none" } 
      }
    >
      <div className="image-container">
        <input 
          type="file" 
          onChange={(e) => setCourForm((prev: F_NewCour) => {
            if ( !e.target.files ) return prev

            const file = e.target.files[0]
            const imageURL = URL.createObjectURL(file)

            return {
              ...prev,
              image: file,
              image_preview: imageURL
            }
          })}
        />

        {
          // If there is no image choose, display a little +
          !courForm.image_preview ?
            <div className="input-style" /> :
            <img 
              className="cour-image" 
              src={courForm.image_preview} 
            />
        }
      </div>

      <section className="cour-information-container">
        <input 
          className="title-input" 
          value={courForm.title} 
          placeholder={"Titre"} 
          onChange={(e) => setCourForm((prev: F_NewCour) => ({ ...prev, title: e.target.value}))}
        />

          <input 
            className="subject-value" 
            placeholder="Sujet" 
            value={courForm.subject} 
            onChange={(e) => setCourForm((prev: F_NewCour) => ({...prev, subject: e.target.value}))} 
          /> 
      </section>

      <div className="buttons-container">
      {
        isCourFilled() && (
          <button 
            className="new-article-button" 
            onClick={handleSave}
          >
            Enregistrer
          </button>
        )
      }
      {
        toggleView && <button 
            className="close-edit-view" 
            onClick={() => toggleView("view")}
            >
              Retour
            </button>
      }
      </div>
    </article>
  )
}
