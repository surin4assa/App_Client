import { Photo } from "./photo";

export interface Member {
  id: number;
  username: string;
  photoUrl: string;
  knownAs: string;
  age: number;
  gender: string;
  created: string;
  lastActive: string;
  introduction: string;
  lookingFor: string;
  interests: string;
  city: string;
  state: string;
  country: string;
  photos: Photo[];
}
