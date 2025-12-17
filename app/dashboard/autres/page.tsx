"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { CourForm, CourDashboardComponent } from "@/components/cour-component"

import { type F_Cour, type F_NewCour } from "@/types/cour-types"

export default function UpdateCour() {
  const [currentCours, setCurrentCours] = useState<F_Cour[]>(null)

  const { loading, fetchResult } = useFetch<F_Cour>('/cours')

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentCours(fetchResult.data);
    }
  }, [loading, fetchResult])

  return <main className="cours-page">
    <a href="/dashboard" className="return">Retour</a>

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
      <CourForm/>
    </ul>
  </main>
}

