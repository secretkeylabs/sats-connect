import { AppConfig, UserSession } from '@stacks/auth';
import { decodeToken } from 'jsontokens';
import type { AuthOptions, AuthResponsePayload } from './types';

const version = '0.0.1';

if (typeof window !== 'undefined') {
  window.__CONNECT_VERSION__ = version;
}

export const isMobile = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return true;
  }
  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }
  return /windows phone/i.test(ua);
};

/**
 * mobile should not use a 'popup' type of window.
 */
export const shouldUsePopup = () => {
  return !isMobile();
};

export const getOrCreateUserSession = (userSession?: UserSession): UserSession => {
  if (!userSession) {
    const appConfig = new AppConfig(['store_write'], document.location.href);
    userSession = new UserSession({ appConfig });
  }
  return userSession;
};

export const authenticate = async (authOptions: AuthOptions) => {
  const provider = window.BitcoinProvider;
  if (!provider) {
    throw new Error('Unable to authenticate without a Bitcoin Wallet extension');
  }

  const {
    redirectTo = '/',
    manifestPath,
    onFinish,
    onCancel,
    sendToSignIn = false,
    userSession: _userSession,
    appDetails,
  } = authOptions;
  const userSession = getOrCreateUserSession(_userSession);
  if (userSession.isUserSignedIn()) {
    userSession.signUserOut();
  }
  const transitKey = userSession.generateAndStoreTransitKey();
  const authRequest = userSession.makeAuthRequest(
    transitKey,
    `${document.location.origin}${redirectTo}`,
    `${document.location.origin}${manifestPath}`,
    userSession.appConfig.scopes,
    undefined,
    undefined,
    {
      sendToSignIn,
      appDetails,
      connectVersion: version,
    }
  );

  try {
    const authResponse = await provider.authenticationRequest(authRequest);
    await userSession.handlePendingSignIn(authResponse);
    const token = decodeToken(authResponse);
    const payload = token?.payload;
    const authResponsePayload = payload as unknown as AuthResponsePayload;
    onFinish?.({
      authResponse,
      authResponsePayload,
      userSession,
    });
  } catch (error) {
    console.error('[Connect] Error during auth request', error);
    onCancel?.();
  }
};

export const getUserData = async (userSession?: UserSession) => {
  userSession = getOrCreateUserSession(userSession);
  if (userSession.isUserSignedIn()) {
    return userSession.loadUserData();
  }
  if (userSession.isSignInPending()) {
    return userSession.handlePendingSignIn();
  }
  return null;
};

export * from './types';
