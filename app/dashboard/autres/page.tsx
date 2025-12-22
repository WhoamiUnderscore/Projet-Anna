"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { CourForm, CourDashboardComponent } from "@/components/cour-component"
import Loading from "@/components/loading"
import Filter from "@/components/filter-component"

import { type F_Cour, type F_NewCour } from "@/types/cour-types"

export default function UpdateCour() {
  const [currentCours, setCurrentCours] = useState<F_Cour[]>([])

  const { loading, fetchResult } = useFetch<F_Cour>('/cours')

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentCours(fetchResult.data);
    }
  }, [loading, fetchResult])

  return <main className="cours-page">
    <Loading loading={loading} />

    <a href="/dashboard" className="return">Retour</a>

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

    <ul className="cours-page-container">
      {
        currentCours === null ?
          null
          :
          currentCours.length > 0 ?
            currentCours.map(c => <CourDashboardComponent cour={c} key={c._id} />)
            :
            <p>Aucun element correspond a ta recherche</p>
      }

      <CourForm />
    </ul>
  </main>
}

