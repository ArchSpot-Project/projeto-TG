export type Role =
  | 'ADMIN'
  | 'STAFF'
  | 'EXTERNAL_COLLABORATOR'
  | 'CUSTOMER';

export interface User {
  id: number;
  cpf: string;
  name: string;
  phone: string;
  address: string;
  profession: string;
  email: string;
  fileUrl: string;
}

export interface UserDTO {
  id: number;
  cpf: string;
  name: string;
  phone: string;
  address: string;
  profession: string;
  email: string;
  password: string;
  fileUrl: string;
}

export interface UserCreateDTO {
  cpf: string;
  name: string;
  phone: string;
  address: string;
  profession: string;
  email: string;
  password: string;
  fileUrl: string;
}

export interface UserUpdateDTO {
  cpf: string;
  name: string;
  phone: string;
  address: string;
  profession: string;
  email: string;
  fileUrl: string;
  password?: string;
}

// Interface opcional só para criação/login (sugestao GPT):
// TODO: Tirar essa senha daqui logo logo...
export interface UserCredentials {
  email: string;
  password: string;
}