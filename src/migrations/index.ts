import * as migration_20260624_121214 from './20260624_121214';

export const migrations = [
  {
    up: migration_20260624_121214.up,
    down: migration_20260624_121214.down,
    name: '20260624_121214'
  },
];
