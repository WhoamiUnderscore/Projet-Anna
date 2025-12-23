"use client"

import { useState, useEffect } from "react"
import { marked } from "marked"
import { useParams } from "next/navigation" 
import Link from "next/link"

import useFetch from "@/hook/useFetch"
import Loading from "@/components/loading"

import { type F_Article } from "@/types/article-types"

export default function ArticlePage(){
  const [renderElements, setRenderElements] = useState<string[]>([])
  const [article, setArticle] = useState<F_Article | null>(null)

  const { id } = useParams<{ id: string }>() 
  const { loading, fetchResult } = useFetch<F_Article>(`/article?id=${id}`);

  useEffect(() => {
    if ( !fetchResult || !fetchResult.data ) return

    setArticle(fetchResult.data)

    const content = fetchResult.data.content.split("|/|").filter((v: string) => v !== "");
    content.forEach((c: string)=> {
      setRenderElements((prev) => {
        const tokens = marked.lexer(c);
        const value = marked.parser(tokens)

        return [...prev, value]
      })
    })

  }, [fetchResult])

  if ( !article ) {
    return <p>Impossible de trouver l'article demander</p>
  }

  return <main className="article-page">
    <Loading loading={loading} />
    
    <Link href={`/mouvements/${article.mouvement.toLowerCase()}`} className="return">Retour</Link>

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
