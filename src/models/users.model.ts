import { mongoose } from '@adarsh-mishra/node-utils/mongoHelpers';

import { users } from '../schemas';
import { IUser } from '../types';

export const UserModel = mongoose.model<IUser>(users.collectionName, users.schema, users.collectionName);
