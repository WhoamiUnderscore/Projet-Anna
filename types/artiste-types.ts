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
  name: string,
  image: File,
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
  name: string,
  image: string,
  metier: string,
  from: number,
  to: number,
  content: string
}
