// @ts-nocheck
"use client"

import useFetch from "@/hook/useFetch"
import Chronologie from "@/components/chronologie"
import Navbar from "@/components/navbar"
import Loading from "@/components/loading"

import { type F_ChronologieElement } from "@/types/chronologie-types"

export default function DashboardPage() {
  const { loading, fetchResult } = useFetch<F_ChronologieElement>("/chronologie");

  if ( loading ) {
    return <Loading />
  }

  return (
    <main className="chronologie-page">
      <Navbar dashboard />
      <Chronologie elements={fetchResult.data} dashboard={true}/>
    </main>
  );
}
