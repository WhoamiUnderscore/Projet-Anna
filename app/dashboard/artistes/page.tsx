// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { ArtisteForm, ArtisteDashboardComponent } from "@/components/artiste-component"
import Loading from "@/components/loading"

import { type F_Artiste, type F_NewArtiste } from "@/types/artiste-types"

export default function UpdateCour() {
  const [currentArtistes, setCurrentArtistes] = useState<F_Artiste[]>(null)
  const [search, setSearch] = useState<String>("");
  const [artistFilter, setArtistFilter] = useState([])

  const { loading, fetchResult } = useFetch<F_Artiste>('/artistes')

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArtistes(fetchResult.data);
    }
  }, [loading, fetchResult])

  useEffect(() => {
    if ( currentArtistes === null ) return 

    function filter_by_name(input: F_Artiste[], search_value: string): F_Artiste[] {
      return input.filter(a => a.name.toLowerCase().includes(search_value.toLowerCase()));
    }

    let all_artistes = fetchResult.data;

    if ( search.length > 3 ) {
      all_artistes = filter_by_name(all_artistes, search)
    }

    setCurrentArtistes(all_artistes)
  }, [search])

  if ( loading ) {
    return <Loading />
  }

  return <main className="artistes-page">
    <a href="/dashboard" className="return">Retour</a>

      {
        currentArtistes !== null && (
          <section className="search-section">
            <input 
              className="search-article" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Nom de l'oeuvre..."
            />
        </section>
      )
    }

    <ul className="artistes-page-container">
      {
        currentArtistes === null ?
          null
          :
          currentArtistes.length > 0 ?
            currentArtistes.map(a => <ArtisteDashboardComponent artiste={a} key={a._id} />)
            :
            <p>Aucun element correspond a ta recherche</p>
      }

      {
        search.length <= 3 &&
        <ArtisteForm/>
      }
    </ul>
  </main>
}

