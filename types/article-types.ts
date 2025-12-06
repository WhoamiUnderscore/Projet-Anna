export type F_Article = {
  _id: string,
  title: string,
  artiste: string,
  date: number,
  image: string,
  mouvement: string
}

// Backend
export type B_NewArticle = {
  title: string,
  artiste: string,
  date: number,
  image: string,
  mouvement: string
}
