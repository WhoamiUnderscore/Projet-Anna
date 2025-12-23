"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation" 
import { marked } from "marked"

import useFetch from "@/hook/useFetch"
import Loading from "@/components/loading"

import { type F_Artiste } from "@/types/artiste-types"

export default function CourPage() {
  const [renderElements, setRenderElements] = useState<string[]>([]);
  const [artiste, setArtiste] = useState<F_Artiste | null>(null)

  const { id } = useParams<{ id: string }>()
  const { loading, fetchResult } = useFetch<F_Artiste>(`/artistes?id=${id}`);

  useEffect(() => {
    if ( !fetchResult || !fetchResult.data ) return

    setArtiste(fetchResult.data)

    const content = fetchResult.data.content.split("|/|").filter((v: string) => v !== "");
    content.forEach((c: string)=> {
      setRenderElements((prev) => {
        const tokens = marked.lexer(c);
        const value = marked.parser(tokens)

        return [...prev, value]
      })
    })

  }, [fetchResult])

  if ( !artiste ) {
    return <p>Impossible de trouver l'article demander</p>
  }

  return <main className="artiste-page">
    <Loading loading={loading} />

    <Link href="/artistes" className="return">Retour</Link>

    <div className="artiste-informations-container">
      <h1 className="artiste-title">{artiste.name}</h1>
      <div className="artiste-information">
        <span>{artiste.metier} | {artiste.from} - {artiste.to}</span>
      </div>
    </div>

    <section className={`renderer-section`}>
      {
        renderElements.length !== 0 ?
          renderElements.map((c, i) => (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: c }}
            />
          ))
          :
          <p>L'article ne contient rien pour l'instant</p>
      }
    </section>
  </main>
}
