export type Person = {
  firstLastName: string;
  club?: string;
  firstName?: string;
  lastName?: string;
};
export interface EnvoyCommittee {
    name: string;
    role: string;
  }
export interface EnvoyShort {
  active: boolean;
  club: string;
  firstName: string;
  id: string;
  districtName: string;
  lastName: string;
  numberOfVotes: number;
  profession: string;
}

export interface Envoy extends EnvoyShort {
  accusativeName: string;
  biography: string;
  birthDate: string;
  birthLocation: string;
  districtNum: number;
  educationLevel: string;
  email: string;
  isFemale: boolean;
  role: string;
  secondName: string | null;
  voivodeship: string;
}
