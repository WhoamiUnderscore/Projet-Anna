"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ErrorHandlerContext } from "@/hook/useErrorHandler"

import { type B_NewChronologie } from "@/types/chronologie-types"

const website_url = "/api"

export default function useFetch<T>(url?: string){
  // =====
  // Init Values
  // =====
  const [loading, setLoading] = React.useState(true);

  const [fetchResult, setFetchResult] = React.useState<DataFetch<T>>({
    data: null,
    status: null,
    message: null
  });

  const router = useRouter();
  const { addError } = React.useContext(ErrorHandlerContext);


  // ======
  // Init Functions
  // ======
  React.useEffect(() => {
    if ( !url ) return 

    async function getDatas() {
      const fetching_data = await fetch(`${website_url}${url}`);
      const body = await fetching_data.json();

      setFetchResult(body)
      setLoading(false)
    }

    getDatas();
  }, [])


  // ======
  // Functions
  // ======
  async function postDatas<T>(data: T, url: string ) {
    setLoading(true)

    try {
      const form_data = createFormData<T>(data);

      const request = await fetch(`${website_url}${url}`, {
        method: "POST",
        body: form_data
      });
      const body = await request.json();
      addError(body)
      setFetchResult(body)

      if ( body.status === 200 ) {
        window.sessionStorage.clear()
      }

    } catch (error) {
      console.error(`ERROR POST: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  async function updateData<T>(data: T, url: string) {
    setLoading(true)

    try {
      const form_data = createFormData<T>(data);

      const request = await fetch(`${website_url}${url}`, {
        method: "PATCH",
        body: form_data
      });
      const body = await request.json();
      addError(body)
      setFetchResult(body)

      if ( body.status === 200 ) {
        window.sessionStorage.clear()
      }

    } catch (error) {
      console.error(`ERROR POST: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  async function deleteData(url: string) {
    setLoading(true)

    try {
      const request = await fetch(`${website_url}${url}`, {
        method: "DELETE",
      });
      const body = await request.json();
      addError(body)
      setFetchResult(body)

    } catch (error) {
      console.error(`ERROR POST: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  function createFormData<T>(data: T): FormData {
    let form_data = new FormData();
    
    for ( const key in data ) {
      let value: any = data[key]

      if (value instanceof File) {
        form_data.append(key, value)
      } else if ( typeof value === "string" || typeof value === "number") {
        form_data.append(key, value)
      }
    }

    return form_data
  }

  return { loading, fetchResult, postDatas, deleteData, updateData }
}
