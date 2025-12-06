"use client"

import * as React from "react"

const website_url = "http://localhost:3000/api"

export default function useFetch<T>(url: string){
  const [loading, setLoading] = React.useState(true);

  const [fetchResult, setFetchResult] = React.useState<DataFetch<T>>({
    data: null,
    status: null,
    message: null
  });

  React.useEffect(() => {
    async function getDatas() {
      const fetching_data = await fetch(`${website_url}${url}`);
      const body = await fetching_data.json();
      console.log(body)
      setFetchResult(body)
      setLoading(false)
    }


    getDatas();
  }, [])

  return { loading, fetchResult }
}
