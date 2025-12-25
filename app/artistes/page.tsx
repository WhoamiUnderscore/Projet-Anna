"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import useFetch from "@/hook/useFetch"
import { ArtisteComponent } from "@/components/artiste-component"
import Loading from "@/components/loading"
import Filter from "@/components/filter-component"

import { type F_Artiste } from "@/types/artiste-types"

export default function ArtistesPage() {
  const [currentArtistes, setCurrentArtistes] = useState<F_Artiste[]>(null)

  const { loading, fetchResult } = useFetch<F_Artiste[]>(`/artistes`);

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data !== null) {
      if ( fetchResult.data.length > 0 ) {
        setCurrentArtistes(fetchResult.data);
      } else {
        setCurrentArtistes(null);
      }
    }
  }, [loading, fetchResult])

  return (
    <main className="artistes-page">
      <Loading loading={loading} />

      <Link href="/" className="return">Retour</Link>

    {
      currentArtistes !== null && (
        <Filter 
          elements={currentArtistes}
          backup_elements={fetchResult.data ? fetchResult.data : []}
          filterProps={{ value: "metier", text: "Choisissez un metier..." }}
          searchProps={{ value: "name", text: "Nom de l'artiste..."}}
          setElement={setCurrentArtistes}
        />
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
