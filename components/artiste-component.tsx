// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"

import { type F_Artiste, type F_NewArtiste } from "@/types/artiste-types"

export function ArtisteComponent({ artiste }: { artiste: F_Artiste }) {
  return (
    <a href={`/artiste/${artiste._id}`} className="artiste-container">
      <div className="image-container">
        <img src={artiste.image} alt="image de cour non charger" />
      </div>

      <section className="artiste-informations">
        <h3>{artiste.name}</h3>
        <p>{artiste.metier} | {artiste.from} - { artiste.to}</p>
      </section>
    </a>
  )
}



export function ArtisteDashboardComponent({ artiste }: { artiste: F_Artiste }) {
  const [deleteElement, setDeleteElement] = useState(false)
  const [updateElement, setUpdateElement] = useState(false)

  const { deleteData } = useFetch();

  if ( updateElement ) {
    return <ArtisteForm default_value={artiste} />
  }

  return <section className="artiste-container">
    <a href={`/dashboard/artistes/${artiste._id}`} className="image-container" style={{ pointerEvents: "all"}}>
      <img className="artiste-image" src={artiste.image} />
    </a>

    {
      // if deleteElement, remove information to minimize the number of informations
      !deleteElement && (
        <section className="cour-information-container">
          <h3>{artiste.name}</h3>
          <p>{artiste.metier} | {artiste.from} - {artiste.to}</p>
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
        <p>Est tu sur de vouloir supprimer <strong>{artiste.name}</strong> ?</p>

        <div className="pop-up-button-container">
          <button 
            className="delete-button" 
            onClick={() => deleteData(`/artistes?id=${artiste._id}`)}
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





export function ArtisteForm({ 
  default_value = {
    name: "",
    metier: "",
    image: "",
    image_preview: "",
    from: 0,
    to:0,
    content: ""
  }
}: { default_value: F_NewArtiste }) {
  const [artisteForm, setArtisteForm] = useState<F_NewArtiste>(default_value)

  const { loading, postDatas, updateData } = useFetch()

  useEffect(() => {
    if ( artisteForm._id ) {
      setArtisteForm((prev) => ({
        ...prev,
        image_preview: prev.image
      }))
    }
  }, [])

  function isArtisteFilled() {
    const { name, from, to, metier, image, content } = artisteForm;

    return name !== "" && from !== 0 && to !== 0 && metier !== "" && image !== "" 
  }

  function handleSave() {
    const { name, metier, from, to, image, content } = artisteForm;

    let valid_data: F_NewArtiste = {
      name,
      metier,
      from,
      to,
      image,
      content
    };

    if ( artisteForm._id ) {
      valid_data._id = artisteForm._id
      updateData<F_Artiste>(valid_data, "/artistes")
    } else {
      postDatas<F_NewArtiste>(valid_data, "/artistes")
    }
  }

  return (
    <article className="artiste-container">
      <div className="image-container">
        <img 
          className="artiste-image" 
          src={artisteForm.image_preview ? artisteForm.image_preview : null} 
        />
        <input 
          type="file" 
          onChange={(e) => setArtisteForm((prev) => {
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
          !artisteForm.image_preview && <div className="input-style" />
        }
      </div>

      <section className="artiste-information-container">
        <input 
          className="title-input" 
          value={artisteForm.name} 
          placeholder={"Nom"} 
          onChange={(e) => setArtisteForm((prev) => ({ ...prev, name: e.target.value}))}
        />

        <div> 
          <input 
            className="subject-value" 
            placeholder="Metier" 
            value={artisteForm.metier} 
            onChange={(e) => setArtisteForm((prev) => ({...prev, metier: e.target.value}))} 
          /> 

          <span>|</span>

          <input 
            className="date-value" 
            pattern="[0-9]*"
            value={artisteForm.from} 
            onChange={(e) => setArtisteForm((prev) => {
              const onlyNumbers = e.target.value.replace(/\D/g, "");
              return { ...prev, from: Number(onlyNumbers)}
            })} 
            />

            <span>-</span>

            <input 
              className="date-value" 
              pattern="[0-9]*"
              value={artisteForm.to} 
              onChange={(e) => setArtisteForm((prev) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                return { ...prev, to: Number(onlyNumbers)}
              })} 
              />
        </div>
      </section>

      {
        isArtisteFilled() && (
          <button 
            className="new-article-button" 
            onClick={handleSave}
          >
            Enregistrer
          </button>
        )
      }
    </article>
  )
}
