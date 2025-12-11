"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { ArticleDashboard, NewArticle } from "@/components/article-component"

import { type F_Article, type B_NewArticle, type F_NewArticle } from "@/types/article-types"

export default function UpdateArticles() {
  const params = useParams<{ mouvement: string }>()
  const { loading, fetchResult } = useFetch<F_Article>(`/article?mouvement=${params.mouvement}`)

  const [currentArticles, setCurrentArticles] = React.useState<F_Article[]>(null)

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
  return <main className="articles-page">
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
      <NewArticle mouvement={params.mouvement}/>
    </ul>
  </main>
}

