export type F_Article = {
  _id: string,
  title: string,
  artiste: string,
  date: number,
  image: string,
  mouvement: string,
  content: string
}

export type F_NewArticle = {
  _id?: string,
  title: string,
  artiste: string,
  date: number,
  image: File | string,
  image_preview: string,
  mouvement: string,
  content: string
}

// Backend
export type B_Article = {
  _id: string,
  title: string,
  artiste: string,
  date: number,
  image: File | string,
  mouvement: string,
  content: string
}

export type B_NewArticle = {
  _id?: string,
  title: string,
  artiste: string,
  date: number,
  image: File | string,
  mouvement: string,
  content: string
}
