export type Person = {
  firstLastName: string
  club?: string
  firstName?: string
  lastName?: string
}
export interface EnvoyCommittee {
  name: string
  role: string
}
export interface EnvoyShort {
  active: boolean
  club: string
  firstName: string
  id: string
  role: string
  districtName: string
  lastName: string
  numberOfVotes: number
  profession: string
  absents: number
}

export interface Envoy extends EnvoyShort {
  accusativeName: string
  firstLastName: string
  biography: string
  biographyUrl?: string
  absents: number
  birthDate: string
  birthLocation: string
  districtNum: number
  genitiveName: string
  educationLevel: string
  email: string
  isFemale: boolean
  role: string
  secondName: string | null
  voivodeship: string
}

export interface RecordHolder {
  name: string
  count: number
  id: string
}
