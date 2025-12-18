// @ts-nocheck
"use client"

import { useEffect, useState } from "react"

import useFetch from "@/hook/useFetch"
import { ArtisteComponent } from "@/components/artiste-component"

import { type F_Artiste } from "@/types/artiste-types"

export default function CoursPage() {
  const [currentArtistes, setCurrentArtistes] = useState<F_Artiste[]>(null)
  const [search, setSearch] = useState<String>("");

  const { loading, fetchResult } = useFetch<F_Artiste[]>(`/artistes`);

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
    return <p>Loading...</p>
  }


  return (
    <main className="artistes-page">
      <a href="/" className="return">Retour</a>

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

    <section className="artiste-container">
    {
      currentArtistes !== null ?
        currentArtistes.map((a) => <ArtisteComponent key={a._id} artiste={a} />)
          :
            <p>Aucun artiste n'a ete cree pour l'instant</p>
    }
    </section>

    </main>
  )
}
