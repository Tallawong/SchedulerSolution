import { User } from './user';

export class FunctionScheduleData {
  userFunction!: string;
  date!: string;
  accounts: User[] = [];
}
