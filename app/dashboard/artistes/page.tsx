// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { ArtisteForm, ArtisteDashboardComponent } from "@/components/artiste-component"

import { type F_Artiste, type F_NewArtiste } from "@/types/artiste-types"

export default function UpdateCour() {
  const [currentArtistes, setCurrentArtistes] = useState<F_Artiste[]>(null)

  const { loading, fetchResult } = useFetch<F_Artiste>('/artistes')

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArtistes(fetchResult.data);
    }
  }, [loading, fetchResult])

  return <main className="artistes-page">
    <a href="/dashboard" className="return">Retour</a>

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
      <ArtisteForm/>
    </ul>
  </main>
}

