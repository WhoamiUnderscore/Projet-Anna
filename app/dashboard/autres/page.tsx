// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import useFetch from "@/hook/useFetch"
import { CourForm, CourDashboardComponent } from "@/components/cour-component"
import Loading from "@/components/loading"

import { type F_Cour, type F_NewCour } from "@/types/cour-types"

export default function UpdateCour() {
  const [currentCours, setCurrentCours] = useState<F_Cour[]>(null)
  const [search, setSearch] = useState<String>("");
  const [courFilter, setCourFilter] = useState([])

  const { loading, fetchResult } = useFetch<F_Cour>('/cours')

  useEffect(() => {
    if ( loading ) return  
    
    if ( fetchResult.status == 200 && fetchResult.data.length > 0) {
      setCurrentCours(fetchResult.data);
      let subjects = "";

      fetchResult.data.forEach((el) => {
         if ( !subjects.includes(el.subjects) ) {
          subjects += "/" + el.subject
        }
      })

      subjects.slice(1).split("/").forEach(s => {
        setCourFilter((prev) => [...prev, {name: s, active: false}])
      })
    }
  }, [loading, fetchResult])

  useEffect(() => {
    if ( currentCours === null ) return 

    function filter_by_name(input: F_Cour[], search_value: string): F_Cour[] {
      return input.filter(c => c.title.toLowerCase().includes(search_value.toLowerCase()));
    }

    function filter_by_subject(input: F_Cour[], subject_name: string): F_Cour[] {
      return input.filter(c => c.subject === subject_name )
    }


    let all_cours = fetchResult.data;
    const current_cour_filter = courFilter.find(c => c.active);

    if ( current_cour_filter ) {
      all_cours = filter_by_subject(all_cours, current_cour_filter.name) ;
    }

    if ( search.length > 3 ) {
      all_cours = filter_by_name(all_cours, search)
    }

    setCurrentCours(all_cours)
  }, [search, courFilter])

  if ( loading ) {
    return <Loading />
  }

  return <main className="cours-page">
    <a href="/dashboard" className="return">Retour</a>

      {
        currentCours !== null && (
          <section className="search-section">
            <input 
              className="search-article" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Nom de l'oeuvre..."
            />

            <select 
              className="select-author" 
              defaultValue="null" 
              onChange={(e) => {
                setCourFilter((prev) => 
                  prev.map((cour, i) => ({
                    name: cour.name,
                    active: i === Number(e.target.value)
                  }))
                )
              }}
            >
              <option value="null">Choisissez un(e) artiste</option>
              {
                courFilter ? 
                  courFilter.map((c, i) => <option key={i} value={i}>{c.name}</option>)
                    :
                      null
              }
          </select>
        </section>
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

      {
        search.length <= 3 && <CourForm/>
      }
    </ul>
  </main>
}

