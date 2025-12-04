"use client"

import * as React from "react"
import { useParams } from "next/navigation" 

import ArticleComponent from "@/components/article-component"

import Fetch from "@/class/fetch-class"

import { type F_Article } from "@/types/article-types"

export default function MouvementPage() {
  const [articles, setArticles] = React.useState<F_Article[]>([])

  const params = useParams<{ mouvement: string }>();

  React.useEffect(() => {
    async function getDatas() {
      let mouvement_name = params.mouvement.charAt(0).toUpperCase() + params.mouvement.slice(1);
      const data = await Fetch.getDatas(`/article?mouvement=${mouvement_name}`);

      if ( data.status === 200 ) {
        setArticles(data.data)
      }
    }

    if ( !params ) return 

    getDatas()
  }, [params])

  return <main>
    <ul className="articles-page-container">
    {
        articles.length > 0 ?
          articles.map(a => <ArticleComponent article={a} key={a._id}/>)
        :
          <p>Aucun exemple n'est present pour ce mouvement</p>
    }
    </ul>
  </main>
}
