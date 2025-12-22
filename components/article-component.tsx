"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"
import DashboardTools from "@/components/dashboard-tools"

import { type F_Article, type F_NewArticle, B_NewArticle } from "@/types/article-types"
import { type DashboardElementState } from "@/types/dashboard-types"

export function ArticleComponent({ article }: { article: F_Article } ) {
  return <a href={`/articles/${article._id}`} className="article-container">
    <div className="image-container">
      <img className="article-image" src={article.image} /> </div>
    <section className="article-information-container">
      <h3>{article.title}</h3>
      <p>{article.artiste} - {article.date}</p>
    </section>
  </a>
}



// ================




export function ArticleDashboard({ article }: { article: F_Article } ) {
  const [elementState, setElementState] = useState<DashboardElementState>("view")

  const toggleView = (view: DashboardElementState) => setElementState(view);

  return <section className="article-container">
    <Link 
      href={`/dashboard/articles/${article._id}`}
      className="image-container" 
      style={ elementState !== "edit" ? { pointerEvents: "all"} : { display: "none" }}
    >
      <img className="article-image" src={article.image} />
    </Link>

    <Link 
      href={`/dashboard/articles/${article._id}`}
      className="article-information-container"
    >
      <h3>{article.title}</h3>
      <p>{article.artiste} - {article.date}</p>
    </Link>

    <ArticleForm 
      default_value={{
        ...article,
        image_preview: article.image,
      } as F_NewArticle} 
      mouvement={article.mouvement} 
      toggleView={toggleView}
      enable={elementState === "edit"}
    />

    {
      elementState !== "edit" && 
        <DashboardTools 
          toggleView={toggleView} 
          state={elementState} 
          element={article} 
        />
    }
  </section>
}



// ================




export function ArticleForm({
  enable = true,
  toggleView,
  mouvement,
  default_value = {
    title: "" ,
    artiste: "",
    date: 0,
    image_preview: "",
    image: "",
    mouvement: "",
    content: ""
  }
}: { 
  mouvement: string, 
  enable?: boolean, 
  toggleView?: ((view: DashboardElementState) => void) | undefined
  default_value?: F_NewArticle, 
}) {
  const [newArticle, setNewArticle] = useState<F_NewArticle>(default_value)

  const { postDatas, updateData } = useFetch()

  function isArticleFilled() {
    const { title, artiste, date, image, mouvement } = newArticle;

    return title !== "" && artiste !== "" && date !== 0 && image !== ""
  }

  function handleSave() {
    const { title, artiste, content, date, image, mouvement } = newArticle;

    if ( !image ) return

    let validData: B_NewArticle = {
      title,
      artiste,
      date,
      image,
      mouvement,
      content
    } 

    if ( newArticle._id ) {
      validData._id = newArticle._id;

      updateData<B_NewArticle>(validData, "/article")
    } else {
      postDatas<B_NewArticle>(validData, "/article")
    }
  }

  return (
    <article 
      className="article-container"
      style={
          !toggleView ? // Is not an editable article 
            { } :
            enable ?
              { position: "absolute", display: "flex" } :
              { display: "none" } 
      }
    >
      {
        // Img -> Display image choose
        // Input -> Choose the image to display ( invisible )
      }
      <div className="image-container">
        <input 
          type="file" 
          onChange={(e) => setNewArticle((prev: F_NewArticle) => {
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
          !newArticle.image_preview ?
            <div className="input-style" /> : 
            <img 
              className="article-image" 
              src={newArticle.image_preview} 
            />
        }
      </div>

      <section className="article-information-container">
        <input 
          className="title-input" 
          value={newArticle.title} 
          placeholder={"Titre"} 
          onChange={(e) => setNewArticle((prev: F_NewArticle) => ({ ...prev, title: e.target.value}))}
        />

        <div> 
          <input 
            className="artiste-value" 
            placeholder="artiste" 
            value={newArticle.artiste} 
            onChange={(e) => setNewArticle((prev: F_NewArticle) => ({...prev, artiste: e.target.value}))} 
          /> 

          <span>-</span>

          <input 
            className="date-value" 
            pattern="[0-9]*"
            value={newArticle.date} 
            onChange={(e) => setNewArticle((prev: F_NewArticle) => {
              const onlyNumbers = e.target.value.replace(/\D/g, "");
              return { ...prev, date: Number(onlyNumbers)}
            })} 
          />
        </div>
      </section>


      <div className="buttons-container">
      {
        isArticleFilled() && (
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
