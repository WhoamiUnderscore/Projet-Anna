// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"

import { type F_Cour, type F_NewCour } from "@/types/cour-types"

export function CourComponent({ cour }: { cour: F_Cour }) {
  return (
    <a href={`/autres/${cour._id}`} className="cour-container">
      <div className="image-container">
        <img src={cour.image} alt="image de cour non charger" />
      </div>

      <section className="cour-informations">
        <h3>{cour.title}</h3>
        <p>{cour.subject}</p>
      </section>
    </a>
  )
}



export function CourDashboardComponent({ cour }: { cour: F_Cour }) {
  const [deleteElement, setDeleteElement] = useState(false)
  const [updateElement, setUpdateElement] = useState(false)

  const { deleteData } = useFetch();

  if ( updateElement ) {
    return <CourForm default_value={cour} />
  }

  return <section className="cour-container">
    <a href={`/dashboard/autres/${cour._id}`} className="image-container" style={{ pointerEvents: "all"}}>
      <img className="cour-image" src={cour.image} />
    </a>

    {
      // if deleteElement, remove information to minimize the number of informations
      !deleteElement && (
        <section className="cour-information-container">
          <h3>{cour.title}</h3>
          <p>{cour.subject}</p>
        </section>
      )
    }

    {
      // Delete and Edit button
      !deleteElement && <section className="chronologie-dashboard">
        <span style={{color: ""}} onClick={() => setUpdateElement(true)}><FontAwesomeIcon icon={faPenToSquare} /></span>        
        <span style={{color: "#d90429"}} onClick={() => setDeleteElement(true)}><FontAwesomeIcon icon={faTrash} /></span>        
      </section>
    }

    {
        // Remove all information and display a "popup" delete prevention to prevent miss-click
        deleteElement && <section className="pop-up-delete-article">
        <p>Est tu sur de vouloir supprimer le mouvement <strong>{cour.title}</strong> ?</p>

        <div className="pop-up-button-container">
          <button 
            className="delete-button" 
            onClick={() => deleteData(`/cours?id=${cour._id}`)}
          >
            Supprimer
          </button>
          <button 
            className="return-button" 
            onClick={() => setDeleteElement(false)}
          >
          Annuler
          </button>
        </div>
      </section>
    }
  </section>
}





export function CourForm({ 
  default_value = {
    title: "",
    subject: "",
    image: "",
    image_preview: "",
    content: ""
  }
}: { default_value: F_NewCour }) {
  const [courForm, setCourForm] = useState<F_NewCour>(default_value)

  const { loading, postDatas, updateData } = useFetch()

  useEffect(() => {
    if ( courForm._id ) {
      setCourForm((prev) => ({
        ...prev,
        image_preview: prev.image
      }))
    }
  }, [])
  
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
      console.log(valid_data)
      updateData<F_Cour>(valid_data, "/cours")
    } else {
      postDatas<F_NewCour>(valid_data, "/cours")
    }
  }

  return (
    <article className="cour-container">
      <div className="image-container">
        <img 
          className="cour-image" 
          src={courForm.image_preview ? courForm.image_preview : null} 
        />
        <input 
          type="file" 
          onChange={(e) => setCourForm((prev) => {
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
          !courForm.image_preview && <div className="input-style" />
        }
      </div>

      <section className="cour-information-container">
        <input 
          className="title-input" 
          value={courForm.title} 
          placeholder={"Titre"} 
          onChange={(e) => setCourForm((prev) => ({ ...prev, title: e.target.value}))}
        />

        <div> 
          <input 
            className="subject-value" 
            placeholder="Sujet" 
            value={courForm.subject} 
            onChange={(e) => setCourForm((prev) => ({...prev, subject: e.target.value}))} 
          /> 
        </div>
      </section>

      {
        isCourFilled() && (
          <button 
            className="new-cour-button" 
            onClick={handleSave}
          >
            Enregistrer
          </button>
        )
      }
    </article>
  )
}
