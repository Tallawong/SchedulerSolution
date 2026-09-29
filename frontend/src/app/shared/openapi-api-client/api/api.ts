export * from './accounts.service';
import { AccountsService } from './accounts.service';
export * from './schedulemeServer.service';
import { SchedulemeServerService } from './schedulemeServer.service';
export const APIS = [AccountsService, SchedulemeServerService];
