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
  title: string,
  artiste: string,
  date: number,
  image: File,
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
  title: string,
  artiste: string,
  date: number,
  image: File | string,
  mouvement: string,
  content: string
}
