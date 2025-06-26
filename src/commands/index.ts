import { data as remindData, execute as remindExecute } from './remind';
import setuser from './setuser';

export const commands = [
  {
    data: remindData,
    execute: remindExecute,
  },
  {
    data: setuser.data,
    execute: setuser.execute,
  },
];
