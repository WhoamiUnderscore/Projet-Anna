// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"

import { type F_Article } from "@/types/article-types"

export function ArticleComponent({ article }: { article: F_Article } ) {
  return <a href={`/articles/${article._id}`} className="article-container">
    <div className="image-container">
      <img className="article-image" src={article.image} />
    </div>

    <section className="article-information-container">
      <h3>{article.title}</h3>
      <p>{article.artiste} - {article.date}</p>
    </section>
  </a>
}



// ================




export function ArticleDashboard({ article }: { article: F_Article } ) {
  const [deleteElement, setDeleteElement] = useState(false)
  const [updateElement, setUpdateElement] = useState(false)

  const { deleteData } = useFetch();

  if ( updateElement ) {
    return <ArticleForm default_value={article} mouvement={article.mouvement} />
  }

  return <section className="article-container">
    <a href={`/dashboard/articles/${article._id}`} className="image-container" style={{ pointerEvents: "all"}}>
      <img className="article-image" src={article.image} />
    </a>

    {
      // if deleteElement, remove information to minimize the number of informations
      !deleteElement && (
        <section className="article-information-container">
          <h3>{article.title}</h3>
          <p>{article.artiste} - {article.date}</p>
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
        <p>Est tu sur de vouloir supprimer le mouvement <strong>{article.title}</strong> ?</p>

        <div className="pop-up-button-container">
          <button 
            className="delete-button" 
            onClick={() => deleteData(`/article?id=${article._id}`)}
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



// ================




export function ArticleForm({
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
}: { mouvement: string, default_value: F_NewArticle }) {
  const [newArticle, setNewArticle] = useState<F_NewArticle>(default_value)

  const { loading, postDatas, updateData } = useFetch()

  useEffect(() => {
    if ( newArticle._id ) {
      setNewArticle((prev) => ({
        ...prev,
        image_preview: prev.image
      }))
    } else {
      let final_mouvement_name: string[] = [];

      mouvement.split("%20").forEach(word => { // Split at url space
        const mouvement_post = word.charAt(0).toUpperCase() + word.slice(1);
        final_mouvement_name.push(mouvement_post)
      })

      setNewArticle((prev) => ({
        ...prev,
        mouvement: final_mouvement_name.join(" ")
      }))
    }
  }, [])

  function isArticleFilled() {
    const { title, artiste, date, image, mouvement } = newArticle;

    return title !== "" && artiste !== "" && date !== 0 && image !== "" 
  }

  function handleSave() {
    const { title, artiste, content, date, image, mouvement } = newArticle;

    let validData: B_NewArticle = {
      title,
      artiste,
      date,
      image,
      mouvement,
      content
    } 

    if ( default_value._id ) {
      validData._id = newArticle._id;

      updateData<F_Article>(validData, "/article")
    } else {
      postDatas<B_NewArticle>(validData, "/article")
    }
  }

  return (
    <article className="article-container">
      {
        // Img -> Display image choose
        // Input -> Choose the image to display ( invisible )
      }
      <div className="image-container">
        <img 
          className="article-image" 
          src={newArticle.image_preview ? newArticle.image_preview : null} 
        />
        <input 
          type="file" 
          onChange={(e) => setNewArticle((prev) => {
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
          !newArticle.image_preview && <div className="input-style" />
        }
      </div>

      <section className="article-information-container">
        <input 
          className="title-input" 
          value={newArticle.title} 
          placeholder={"Titre"} 
          onChange={(e) => setNewArticle((prev) => ({ ...prev, title: e.target.value}))}
        />

        <div> 
          <input 
            className="artiste-value" 
            placeholder="artiste" 
            value={newArticle.artiste} 
            onChange={(e) => setNewArticle((prev) => ({...prev, artiste: e.target.value}))} 
          /> 

          <span>-</span>

          <input 
            className="date-value" 
            pattern="[0-9]*"
            value={newArticle.date} 
            onChange={(e) => setNewArticle((prev) => {
              const onlyNumbers = e.target.value.replace(/\D/g, "");
              return { ...prev, date: Number(onlyNumbers)}
            })} 
          />
        </div>
      </section>

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
    </article>
  )
}
