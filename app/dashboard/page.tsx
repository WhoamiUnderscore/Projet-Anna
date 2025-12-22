"use client"

import { useState, useEffect } from "react"

import useFetch from "@/hook/useFetch"
import Chronologie from "@/components/chronologie"
import Navbar from "@/components/navbar"
import Loading from "@/components/loading"

import { type F_ChronologieElement } from "@/types/chronologie-types"

export default function DashboardPage() {
  const [currentChronologieElement, setCurrentChronologieElement] = useState<F_ChronologieElement[]>([])
  const { loading, fetchResult } = useFetch<F_ChronologieElement>("/chronologie");

  useEffect(() => {

    console.log(fetchResult.body)

    if ( fetchResult.status === 200 ) {
      setCurrentChronologieElement(fetchResult.data);
    }

  }, [fetchResult])

  return (
    <main className="chronologie-page">
      <Loading loading={loading}/>

      <Navbar dashboard />

      <Chronologie elements={currentChronologieElement} dashboard={true}/>
    </main>
  );
}
