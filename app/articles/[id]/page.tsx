"use client"

import { useState, useEffect } from "react"
import { marked } from "marked"
import { useParams } from "next/navigation" 

import useFetch from "@/hook/useFetch"

export default function ArticlePage(){
  const [renderElements, setRenderElements] = useState<string[]>([])
  const [article, setArticle] = useState(null)

  const { id } = useParams<{ id: string }>() 
  const { loading, fetchResult } = useFetch<F_ChronologieElement>(`/article?id=${id}`);

  useEffect(() => {
    if ( !fetchResult || !fetchResult.data ) return

    setArticle(fetchResult.data)

    const content = fetchResult.data.content.split("|/|").filter(v => v !== "");
    content.forEach(c => {
      setRenderElements((prev) => [...prev, marked.parse(c)])
    })

  }, [fetchResult])

  if ( !article ) {
    return <p>Impossible de trouver l'article demander</p>
  }

  return <main className="article-page">
    <a href={`/mouvements/${article.mouvement.toLowerCase()}`} className="return">Retour</a>

    <div className="article-informations-container">
      <h1 className="article-title">{article.title}</h1>
      <div className="article-information">
        <span>{article.artiste}</span> 
          - 
        <span>{article.date}</span>
      </div>
    </div>

    <section className={`renderer-section`}>
      {
        renderElements.length !== 0 ?
          renderElements.map((c, i) => (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: c }}
            />
          ))
          :
          <p>L'article ne contient rien pour l'instant</p>
      }
    </section>
  </main>
}
