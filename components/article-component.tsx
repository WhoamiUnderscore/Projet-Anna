"use client"

import * as React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import useFetch from "@/hook/useFetch"

import { type F_Article } from "@/types/article-types"

export function ArticleComponent({ article }: { article: F_Article } ) {
  return <a href={""} className="article-container">
    <div className="image-container">
      <img className="article-image" src={article.image} />

    </div>
    <section className="article-information-container">
      <h3>{article.title}</h3>
      <p>{article.artiste} - {article.date}</p>
    </section>
  </a>
}

export function ArticleDashboard({ article }: { article: F_Article } ) {
  const [deleteElement, setDeleteElement] = React.useState(false)
  const [updateElement, setUpdateElement] = React.useState(false)

  const { deleteData } = useFetch();

  if ( updateElement ) {
    return <NewArticle default_value={article} mouvement={article.mouvement} />
  }

  return <section className="article-container">
    <a href={`/dashboard/articles/${article._id}`} className="image-container" style={{ pointerEvents: "all"}}>
      <img className="article-image" src={article.image} />
    </a>

    {
      !deleteElement && (
        <section className="article-information-container">
          <h3>{article.title}</h3>
          <p>{article.artiste} - {article.date}</p>
        </section>
      )}

    {
      // Delete and Edit button
      !deleteElement && <section className="chronologie-dashboard">
        <span style={{color: ""}} onClick={() => setUpdateElement(true)}><FontAwesomeIcon icon={faPenToSquare} /></span>        
        <span style={{color: "#d90429"}} onClick={() => setDeleteElement(true)}><FontAwesomeIcon icon={faTrash} /></span>        
      </section>
    }

    {
        deleteElement && <section className="pop-up-delete-article">
        <p>Est tu sur de vouloir supprimer le mouvement <strong>{article.title}</strong> ?</p>

        <div className="pop-up-button-container">
          <button className="delete-button" onClick={() => deleteData(`/article?id=${article._id}`)}>Supprimer</button>
          <button className="return-button" onClick={() => setDeleteElement(false)}>Annuler</button>
        </div>
      </section>
    }
  </section>
}

export function NewArticle({
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
  const [newArticle, setNewArticle] = React.useState<F_NewArticle>(default_value)

  const { loading, postDatas, updateData } = useFetch()

  function validConditions() {
    const { title, artiste, date, image, mouvement } = newArticle;

    return title !== "" && artiste !== "" && date !== 0 && image !== "" 
  }

  React.useEffect(() => {
    if ( newArticle._id ) {
      setNewArticle((prev) => ({
        ...prev,
        image_preview: prev.image
      }))
    } else {
      const mouvement_post = mouvement.charAt(0).toUpperCase() + mouvement.slice(1);
      setNewArticle((prev) => ({
        ...prev,
        mouvement: mouvement_post
      }))
    }
  }, [])

  return (
    <article className="article-container">
      <div className="image-container">
        <img className="article-image" src={newArticle.image_preview ? newArticle.image_preview : null} />
        <input type="file" onChange={(e) => setNewArticle((prev) => {
          const file = e.target.files[0]
          const imageURL = URL.createObjectURL(file)

          return {
            ...prev,
            image: file,
            image_preview: imageURL
          }
        })}/>

        {
          !newArticle.image_preview && <div className="input-style" />
        }
      </div>
      <section className="article-information-container">
        <input className="title-input" value={newArticle.title} placeholder={"Titre"} onChange={(e) => setNewArticle((prev) => ({ ...prev, title: e.target.value}))}/>
        <div> 
          <input className="artiste-value" placeholder="artiste" value={newArticle.artiste} onChange={(e) => setNewArticle((prev) => ({...prev, artiste: e.target.value}))} /> 
          -
          <input className="date-value" value={newArticle.date} onChange={(e) => setNewArticle((prev) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            return { ...prev, date: Number(onlyNumbers)}
          })} pattern="[0-9]*"/>
        </div>
      </section>

      {
        validConditions() && <button className="new-article-button" onClick={() => {
          const { title, artiste, content, date, image, mouvement } = newArticle;
          const validData: B_NewArticle = {
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
        }}>Enregistrer</button>
      }
    </article>
  )
}
