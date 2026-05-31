import { CallRole, RoomCode } from '@features/call/model/types';

/**
 * Navigation contract. Centralizing the param list gives every screen
 * type-safe params and is the one place new routes are declared.
 */
export type RootStackParamList = {
  Home: undefined;
  Call: { roomCode: RoomCode; role: CallRole };
};
