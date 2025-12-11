"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import ArticleComponent from "@/components/article-component"

import { type F_Article, type B_NewArticle, type F_NewArticle } from "@/types/article-types"

export default function UpdateArticles() {
  const params = useParams<{ mouvement: string }>()
  const { loading, fetchResult, postDatas } = useFetch<F_Article>(`/article?mouvement=${params.mouvement}`)

  const [currentArticles, setCurrentArticles] = React.useState<F_Article[]>(null)
  const [newArticle, setNewArticle] = React.useState<F_NewArticle>({
    title: "" ,
    artiste: "",
    date: 0,
    image_preview: "",
    image: "",
    mouvement: params.mouvement,
    content: ""
  })

  function validConditions() {
    const { title, artiste, date, image, mouvement } = newArticle;

    return title !== "" && artiste !== "" && date !== 0 && image !== "" 
  }

  React.useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArticles(fetchResult.data);
      let artistes = "";

      fetchResult.data.forEach((el) => {
         if ( !artistes.includes(el.artiste) ) {
          artistes += "/" + el.artiste
        }
      })

      // artistes.slice(1).split("/").forEach(a => {
      //   setArtistFilter((prev) => [...prev, {name: a, active: false}])
      // })

    }
  }, [loading, fetchResult])
  return <main>
    <ul className="articles-page-container">
      {
        currentArticles === null ?
          <p>Aucun exemple n'est present pour ce mouvement</p>
          :
          currentArticles.length > 0 ?
            currentArticles.map(a => <ArticleComponent article={a} key={a._id} dashboard={true}/>)
            :
            <p>Aucun element correspond a ta recherche</p>
      }

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

            postDatas<B_NewArticle>(validData, "/article")
          }}>Enregistrer</button>
        }
      </article>
    </ul>
  </main>
}
