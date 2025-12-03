// Fontend
export type F_ChronologieElement = {
  _id: string,
  name: string,
  from: number,
  to: number
}

// Backend
export type B_NewChronologie = {
  name: string,
  from: number,
  to: number
}
