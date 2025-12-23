"use client"

import useFetch from "@/hook/useFetch"
import Chronologie from "@/components/chronologie"
import Navbar from "@/components/navbar"
import Loading from "@/components/loading"

import { type F_ChronologieElement } from "@/types/chronologie-types"

export default function Home() {
  const { loading, fetchResult } = useFetch<F_ChronologieElement[]>("/chronologie");

  return (
    <main className="chronologie-page">
      <Loading loading={loading} />

      <Navbar dashboard={false} />

      {
        fetchResult.status === 200 && fetchResult.data && fetchResult.data.length > 0 ?
          <Chronologie elements={fetchResult.data} dashboard={false}/>
          : 
          <section className="no-chronologie-container">
            <p>Il n'y a pas encore de mouvement enregistré</p>
          </section>
      }
    </main>
  );
}
