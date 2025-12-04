export type F_Article = {
  _id: string,
  title: string,
  description: string,
  image: string,
  mouvement: string
}

// Backend
export type B_NewArticle = {
  title: string,
  description: string,
  image: string,
  mouvement: string
}
