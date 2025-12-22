"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation" 

import useFetch from "@/hook/useFetch"
import { ArticleComponent } from "@/components/article-component"
import Loading from "@/components/loading"
import Filter from "@/components/filter-component"

import { type F_Article } from "@/types/article-types"

export default function MouvementPage() {
  const [currentArticles, setCurrentArticles] = useState<F_Article[]>([])

  const params = useParams<{ mouvement: string }>();
  const { loading, fetchResult } = useFetch<F_Article>(`/article?mouvement=${params.mouvement}`);

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArticles(fetchResult.data);
    }
  }, [loading, fetchResult])

  return <main className="articles-page">
    <Loading loading={loading} />

    <a href="/" className="return">Retour</a>

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
          <p>Aucun exemple n'est present pour ce mouvement</p>
          :
          currentArticles.length > 0 ?
            currentArticles.map(a => <ArticleComponent article={a} key={a._id}/>)
            :
            <p>Aucun element correspond a ta recherche</p>
      }
    </ul>
  </main>
}
