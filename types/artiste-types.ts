export type F_Artiste = {
  _id: string,
  name: string,
  image: string,
  metier: string,
  from: number,
  to: number,
  content: string
}

export type F_NewArtiste = {
  _id?: string,
  name: string,
  image: File | string,
  image_preview?: string,
  metier: string,
  from: number,
  to: number,
  content: string
}

export type B_Artiste = {
  name: string,
  image: string | File,
  metier: string,
  from: number,
  to: number,
  content: string
}

export type B_NewArtiste = {
  _id?: string,
  name: string,
  image: string,
  metier: string,
  from: number,
  to: number,
  content: string
}
