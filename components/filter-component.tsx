"use client"

import { useState, useEffect } from "react"

import { type F_ChronologieElement } from "@/types/chronologie-types"
import { type F_Cour } from "@/types/cour-types"
import { type F_Artiste } from "@/types/artiste-types"
import { type F_Article } from "@/types/article-types"

type FilterType = {name: string, active: boolean}

export default function Filter<T extends Record<string, string | number>>({
  elements,
  setElement,
  backup_elements,
  filterProps,
  searchProps,
} : {
  elements: T[],
  setElement: (el: T[]) => void,
  backup_elements: T[],
  filterProps?: { value: keyof T, text: string },
  searchProps?: { value: keyof T, text: string },
}) {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<FilterType[]>([])

  useEffect(() => {
    if ( !filterProps ) return

      let elementsToFilter= new Set<string>();


      elements.forEach((el: T) => {
        elementsToFilter.add(el[filterProps.value] as string)
      })

      setFilter(
        Array.from(elementsToFilter).map((e) => ({
          name: e,
          active: false
        }))
      )
  }, [])

  useEffect(() => {
    if ( elements === null ) return 

    function search_by_key(input: T[], search_value: string): T[] {
      if ( !searchProps ) return input

      return input.filter((e: T) => (e[searchProps.value] as string).toLowerCase().includes(search_value.toLowerCase()));
    }

    function filter_by_key(input: T[], filter_value: string): T[] {
      if ( !filterProps ) return input

      return input.filter((e: T) => e[filterProps.value] === filter_value)
    }


    let all_elements= backup_elements;
    const current_elements_filter = filter.find(e => e.active);

    if ( current_elements_filter ) {
      all_elements = filter_by_key(all_elements, current_elements_filter.name) ;
    }

    if ( search.length > 3 ) {
      all_elements = search_by_key(all_elements, search)
    }

    setElement(all_elements)
  }, [search, filter])

  return (
    <section className="search-section">
      { 
        searchProps ?
        <input 
          className="search-article" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder={searchProps.text}
        />
        :
        null
      }

      { 
        filterProps ?
        <select 
          className="select-author" 
          defaultValue="null" 
          onChange={(e) => {
            setFilter((prev) => 
              prev.map((el, i) => ({
                ...el,
                active: i === Number(e.target.value)
              }))
            )
          }}
        >
          <option value="null">{filterProps.text}</option>
          {
            filter ? 
              filter.map((e, i) => <option key={i} value={i}>{e.name}</option>)
              :
              null
          }
        </select>
        :
        null
      }
    </section>
  )
}
