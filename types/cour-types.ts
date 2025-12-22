export type F_Cour = {
  _id: string,
  title: string,
  image: string,
  subject: string,
  content: string
}

export type F_NewCour = {
  _id?: string,
  title: string,
  image: File | string,
  image_preview?: string,
  subject: string,
  content: string
}

export type B_Cour = {
  _id: string,
  title: string,
  image: string | File,
  subject: string,
  content: string
}
