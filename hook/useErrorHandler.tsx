"use client"

import * as React from "react"

import { type DataFetch } from "@/types/fetch-types"

export const ErrorHandlerContext = React.createContext({
  errors: [],
  addError: (error: DataFetch<any>) => {}
});

export function ErrorHandlerProvider({children}) {
  const [errors, setErrors] = React.useState<DataFetch<any>[]>([]);

  function addError( error: DataFetch<any> ) {
    setErrors((prev) => [error, ...prev])
    const timeout = setTimeout(() => {
      setErrors((prev) => prev.filter((er) => er.id !== error.id))
    }, 5000);
  }

  return <ErrorHandlerContext.Provider value={{ errors, addError }}>
    {
      errors.map((el, i) => (
        <section key={el.id} className={`fetch-return ${el.status === 200 ? "success-return" : "error-return"}`} style={{ top: `${(80 * i) + 20 }px`}}>
          {el.message}
        </section>
      ))
    }
    {children}
  </ErrorHandlerContext.Provider>
}
