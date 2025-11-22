import path from 'path';

export const connection = {
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'db', 'database.sqlite'),
};
