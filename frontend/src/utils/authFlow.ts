export type AuthMode = 'login' | 'signup';
export type AuthSuccessAction = 'show-login' | 'complete';

export const getAuthSuccessAction = (mode: AuthMode): AuthSuccessAction =>
  mode === 'signup' ? 'show-login' : 'complete';
