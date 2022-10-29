import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { users } from '../schemas';
import { IUserRaw } from '../types';

export const UserModel = mongoose.model<IUserRaw>(users.schemaName, users.schema, users.schemaName);
