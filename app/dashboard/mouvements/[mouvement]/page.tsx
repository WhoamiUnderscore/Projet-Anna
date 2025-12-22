"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { ArticleDashboard, ArticleForm } from "@/components/article-component"
import Loading from "@/components/loading"
import Filter from "@/components/filter-component"

import { type F_Article, type B_NewArticle, type F_NewArticle } from "@/types/article-types"

export default function UpdateArticles() {
  const [currentArticles, setCurrentArticles] = useState<F_Article[]>([])

  const params = useParams<{ mouvement: string }>()
  const { loading, fetchResult } = useFetch<F_Article>(`/article?mouvement=${params.mouvement}`)

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArticles(fetchResult.data);
    }
  }, [loading, fetchResult])

  return <main className="articles-page">
    <Loading loading={loading} />
    
    <a href="/dashboard" className="return">Retour</a>

    {
      currentArticles !== null && (
        <Filter 
          elements={currentArticles}
          backup_elements={fetchResult.data}
          filterProps={{ value: "artiste", text: "Choisissez un artiste..." }}
          searchProps={{ value: "title", text: "Nom de l'oeuvre..."}}
          setElement={setCurrentArticles}
        />
      )
    }

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

      <ArticleForm mouvement={params.mouvement} />
    </ul>
  </main>
}

