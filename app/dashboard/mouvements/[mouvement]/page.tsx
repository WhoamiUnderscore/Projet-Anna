"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { ArticleDashboard, ArticleForm } from "@/components/article-component"

import { type F_Article, type B_NewArticle, type F_NewArticle } from "@/types/article-types"

export default function UpdateArticles() {
  const [currentArticles, setCurrentArticles] = useState<F_Article[]>(null)
  const params = useParams<{ mouvement: string }>()

  const { loading, fetchResult } = useFetch<F_Article>(`/article?mouvement=${params.mouvement}`)

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArticles(fetchResult.data);
      let artistes = "";

      fetchResult.data.forEach((el) => {
         if ( !artistes.includes(el.artiste) ) {
          artistes += "/" + el.artiste
        }
      })
    }
  }, [loading, fetchResult])

  return <main className="articles-page">
    <a href="/dashboard" className="return">Retour</a>

    <ul className="articles-page-container">
      {
        currentArticles === null ?
          null
          :
          currentArticles.length > 0 ?
            currentArticles.map(a => <ArticleDashboard article={a} key={a._id} />)
            :
            <p>Aucun element correspond a ta recherche</p>
      }
      <ArticleForm mouvement={params.mouvement}/>
    </ul>
  </main>
}

