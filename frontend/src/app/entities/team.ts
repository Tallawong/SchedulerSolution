import { User } from './user';

export class Team {
  id!: string;
  userFunction!: string;
  string!: Date;
  users: User[] = [];
}
