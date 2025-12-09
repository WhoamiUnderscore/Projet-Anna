"use client"

import useFetch from "@/hook/useFetch"
import Chronologie from "@/components/chronologie"

import { type F_ChronologieElement } from "@/types/chronologie-types"

export default function DashboardPage() {
  const { loading, fetchResult } = useFetch<F_ChronologieElement>("/chronologie");

  if ( loading ) return <p>loading...</p>

  return (
    <main>
      <Chronologie elements={fetchResult.data} dashboard={true}/>
    </main>
  );
}
