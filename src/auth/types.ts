import type { UserSession } from "@stacks/auth";

export interface AuthResponsePayload {
  private_key: string;
  username: string | null;
  hubUrl: string;
  associationToken: string;
  blockstackAPIUrl: string | null;
  core_token: string | null;
  email: string | null;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  version: string;
  profile: any;
  profile_url: string;
  public_keys: string[];
}

export interface FinishedAuthData {
  authResponse: string;
  authResponsePayload: AuthResponsePayload;
  userSession: UserSession;
}

declare global {
  interface Window {
    __CONNECT_VERSION__?: string;
  }

  const __VERSION__: string;
}

export interface AuthOptions {
  /** The URL you want the user to be redirected to after authentication. */
  redirectTo?: string;
  manifestPath?: string;
  /**
   * This callback is fired after authentication is finished.
   * The callback is called with a single object argument, with three keys:
   * `authResponse`: the raw `authResponse` string that is returned from authentication
   * `authResponsePayload`: an AuthResponsePayload object
   * `userSession`: a UserSession object with `userData` included
   * */
  onFinish?: (payload: FinishedAuthData) => void;
  /** This callback is fired if the user exits before finishing */
  onCancel?: () => void;
  /**
   * @deprecated Authentication is no longer supported through a hosted
   * version. Users must install an extension.
   */
  authOrigin?: string;
  /** If `sendToSignIn` is `true`, then the user will be sent through the sign in flow. */
  sendToSignIn?: boolean;
  userSession?: UserSession;
  appDetails: {
    /** A human-readable name for your application */
    name: string;
    /** A full URL that resolves to an image icon for your application */
    icon: string;
  };
}
