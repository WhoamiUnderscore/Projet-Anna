// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { ArtisteForm, ArtisteDashboardComponent } from "@/components/artiste-component"
import Loading from "@/components/loading"
import Filter from "@/components/filter-component"

import { type F_Artiste, type F_NewArtiste } from "@/types/artiste-types"

export default function UpdateArtiste() {
  const [currentArtistes, setCurrentArtistes] = useState<F_Artiste[]>([])

  const { loading, fetchResult } = useFetch<F_Artiste>('/artistes')

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentArtistes(fetchResult.data);
    }
  }, [loading, fetchResult])

  return <main className="artistes-page">
    <Loading loading={loading} />

    <a href="/dashboard" className="return">Retour</a>

    {
      currentArtistes !== null && (
        <Filter 
          elements={currentArtistes}
          backup_elements={fetchResult.data}
          filterProps={{ value: "metier", text: "Choisissez un metier..." }}
          searchProps={{ value: "name", text: "Nom de l'artiste..."}}
          setElement={setCurrentArtistes}
        />
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

      <ArtisteForm/>
    </ul>
  </main>
}

