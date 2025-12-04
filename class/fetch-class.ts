import { type DataFetch, type FetchError } from "@/types/fetch-types";

export default class Fetch<T> {
  static website_url = "http://localhost:3000/api";

  static async getDatas(url: string): Promise<DataFetch | FetchError> {
    const fetching_data = await fetch(`${Fetch.website_url}${url}`);
    const body = await fetching_data.json();

    if ( fetching_data.status === 200 ) {
      return body as DataFetch
    }

    return {
      message: body.message,
      status: body.status
    } as FetchError
  }
}
