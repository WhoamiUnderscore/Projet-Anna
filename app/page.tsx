// @ts-nocheck
"use client"

import useFetch from "@/hook/useFetch"
import Chronologie from "@/components/chronologie"
import Navbar from "@/components/navbar"

import { type F_ChronologieElement } from "@/types/chronologie-types"

export default function Home() {
  const { loading, fetchResult } = useFetch<F_ChronologieElement>("/chronologie");

  if ( loading ) return <p>loading...</p>

  return (
    <main className="chronologie-page">
      <Navbar dashboard={false} />
      {
        fetchResult.status === 200 && fetchResult.data.length > 0 ?
          <Chronologie elements={fetchResult.data} dashboard={false}/>
          : 
          <section className="no-chronologie-container">
            <p>Il n'y a pas encore de mouvement enregistré</p>
          </section>
      }
    </main>
  );
}
