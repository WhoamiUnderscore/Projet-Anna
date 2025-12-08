"use client"

import useFetch from "@/hook/useFetch"
import Chronologie from "@/components/chronologie"

import { type F_ChronologieElement } from "@/types/chronologie-types"

export default function DashboardPage() {
  const { loading, fetchResult } = useFetch<F_ChronologieElement>("/chronologie");

  if ( loading ) return <p>loading...</p>

  return (
    <main>
      {
        fetchResult.status === 200 && fetchResult.data.length > 0 ?
          <Chronologie elements={fetchResult.data} dashboard={true}/>
          : 
          <p>erreur</p>
      }
    </main>
  );
}
