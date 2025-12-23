"use client"

import { useState, useEffect } from "react"
import { marked } from "marked"
import { useParams } from "next/navigation" 
import Link from "next/link"

import useFetch from "@/hook/useFetch"
import Loading from "@/components/loading"

import { type F_Cour } from "@/types/cour-types"

export default function CourPage() {
  const [renderElements, setRenderElements] = useState<string[]>([]);
  const [cour, setCour] = useState<F_Cour | null>(null)

  const { id } = useParams<{ id: string }>()
  const { loading, fetchResult } = useFetch<F_Cour>(`/cours?id=${id}`);

  useEffect(() => {
    if ( !fetchResult || !fetchResult.data ) return

    setCour(fetchResult.data)

    const content = fetchResult.data.content.split("|/|").filter((v: string) => v !== "");
    content.forEach((c: string)=> {
      setRenderElements((prev) => {
        const tokens = marked.lexer(c);
        const value = marked.parser(tokens)

        return [...prev, value]
      })
    })

  }, [fetchResult])

  if ( !cour ) {
    return <p>Impossible de trouver l'article demander</p>
  }

  return <main className="cour-page">
    <Loading loading={loading} />

    <Link href="/autres" className="return">Retour</Link>

    <div className="cour-informations-container">
      <h1 className="cour-title">{cour.title}</h1>
      <div className="cour-information">
        <span>{cour.subject}</span>
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
