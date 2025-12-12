"use client"

import * as React from "react"
import { useParams } from "next/navigation" 

import useFetch from "@/hook/useFetch"
import { ArticleComponent } from "@/components/article-component"

import { type F_Article } from "@/types/article-types"

export default function MouvementPage() {
  const [currentArticles, setCurrentArticles] = React.useState<F_Article[]>(null)
  const [search, setSearch] = React.useState<String>("");
  const [artistFilter, setArtistFilter] = React.useState([])

  const params = useParams<{ mouvement: string }>();
  const { loading, fetchResult } = useFetch<F_Article>(`/article?mouvement=${params.mouvement}`);

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

      artistes.slice(1).split("/").forEach(a => {
        setArtistFilter((prev) => [...prev, {name: a, active: false}])
      })

    }
  }, [loading, fetchResult])


  React.useEffect(() => {
    function filter_by_name(input: F_Article[], search_value: string): F_Article[] {
      return input.filter(a => a.title.toLowerCase().includes(search_value.toLowerCase()));
    }

    function filter_by_artist(input: F_Article[], artist_name: string): F_Article[] {
      return input.filter(a => a.artiste === artist_name )
    }

    if ( currentArticles === null ) return 

    let all_articles = fetchResult.data;

    const current_artist_filter = artistFilter.find(a => a.active);
    if ( current_artist_filter ) {
      all_articles = filter_by_artist(all_articles, current_artist_filter.name) ;
    }

    if ( search.length > 3 ) {
      all_articles = filter_by_name(all_articles, search)
    }

    setCurrentArticles(all_articles)
  }, [search, artistFilter])


  if ( loading ) {
    return <p>Loading...</p>
  }

  return <main className="articles-page">
    <a href="/" className="return">Retour</a>
    {
      currentArticles !== null && (
        <section className="search-section">
          <input className="search-article" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={"Nom de l'oeuvre..."}/>

          <select className="select-author" defaultValue="null" onChange={(e) => {
            const index = Number(e.target.value);

            setArtistFilter((prev) => (
              prev.map((artist, i) => ({
                name: artist.name,
                active: i === index
              }))
            ))
          }}>
            <option value="null">Choisissez un(e) artiste</option>
            {
              artistFilter ? 
                artistFilter.map((a, i) => <option key={i} value={i}>{a.name}</option>)
                :
                null
            }
          </select>
        </section>
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
