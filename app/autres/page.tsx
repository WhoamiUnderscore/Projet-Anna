"use client"

import { useEffect, useState } from "react"

import useFetch from "@/hook/useFetch"
import { CourComponent } from "@/components/cour-component"
import Loading from "@/components/loading"
import Filter from "@/components/filter-component"

import { type F_Cour } from "@/types/cour-types"

export default function CoursPage() {
  const [currentCours, setCurrentCours] = useState<F_Cour[]>([])

  const { loading, fetchResult } = useFetch<F_Cour[]>(`/cours`);

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentCours(fetchResult.data);
    }
  }, [loading, fetchResult])

  return (
    <main className="cours-page">
      <Loading loading={loading}/>

      <a href="/" className="return">Retour</a>

    {
      currentCours !== null && (
        <Filter 
          elements={currentCours}
          backup_elements={fetchResult.data}
          filterProps={{ value: "subject", text: "Choisissez un sujet..." }}
          searchProps={{ value: "title", text: "Nom du cour..."}}
          setElement={setCurrentCours}
        />
      )
    }

    <section className="cours-container">
    {
      currentCours !== null ?
        currentCours.map((c) => <CourComponent key={c._id} cour={c} />)
          :
            <p>Aucun cour n'a ete cree pour l'instant</p>
    }
    </section>

    </main>
  )
}
