"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"
import DashboardTools from "@/components/dashboard-tools"

import { type F_Artiste, type F_NewArtiste } from "@/types/artiste-types"
import { type DashboardElementState } from "@/types/dashboard-types"

export function ArtisteComponent({ artiste }: { artiste: F_Artiste }) {
  return (
    <a href={`/artistes/${artiste._id}`} className="artiste-container">
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
  const [elementState, setElementState] = useState<DashboardElementState>("view")

  const toggleView = (view: DashboardElementState) => setElementState(view);

  return <section className="artiste-container">
    <Link 
      href={`/dashboard/artistes/${artiste._id}`} 
      className="image-container" 
      style={ elementState === "edit" ? { display: "none" } : { pointerEvents: "all"}}
    >
      <img className="artiste-image" src={artiste.image} />
    </Link>

    <Link href={`/dashboard/artistes/${artiste._id}`} className="cour-information-container">
      <h3>{artiste.name}</h3>
      <p>{artiste.metier} | {artiste.from} - {artiste.to}</p>
    </Link>

    <ArtisteForm 
      default_value={{
        ...artiste,
        image_preview: artiste.image,
      } as F_NewArtiste} 
      toggleView={toggleView}
      enable={elementState === "edit"}
    />

    {
      elementState !== "edit" && 
        <DashboardTools 
          toggleView={toggleView} 
          state={elementState} 
          element={artiste} 
        />
    }
  </section>
}





export function ArtisteForm({ 
  enable = true,
  toggleView,
  default_value = {
    name: "",
    metier: "",
    image: "",
    image_preview: "",
    from: 0,
    to:0,
    content: ""
  }
}: { 
  enable?: boolean,
  toggleView?: (view: DashboardElementState) => void,
  default_value?: F_NewArtiste 
}) {
  const [artisteForm, setArtisteForm] = useState<F_NewArtiste>(default_value)

  const { postDatas, updateData } = useFetch()

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

    if ( artisteForm._id !== undefined ) {
      valid_data._id = artisteForm._id

      updateData<F_NewArtiste>(valid_data, "/artistes")
    } else {
      postDatas<F_NewArtiste>(valid_data, "/artistes")
    }
  }

  return (
    <article 
      className="artiste-container"
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
          onChange={(e) => setArtisteForm((prev: F_NewArtiste) => {
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
          !artisteForm.image_preview ?
            <div className="input-style" /> :
            <img 
              className="artiste-image" 
              src={artisteForm.image_preview} 
            />
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

      <div className="buttons-container">
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
