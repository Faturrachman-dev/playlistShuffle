const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

function waitForGis(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) { clearInterval(interval); resolve(); }
    }, 100);
  });
}

export async function requestAccessToken(): Promise<{ token: string; expiresAt: number }> {
  await waitForGis();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        resolve({
          token: response.access_token,
          expiresAt: Date.now() + response.expires_in * 1000,
        });
      },
      error_callback: (err) => reject(new Error(err.type)),
    });
    client.requestAccessToken();
  });
}

export function revokeToken(token: string): void {
  window.google?.accounts.oauth2.revoke(token);
}
