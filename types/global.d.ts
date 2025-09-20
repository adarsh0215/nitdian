// types/global.d.ts
export {}; // make this file a module

declare global {
  interface GoogleCredentialResponse {
    credential?: string;
    clientId?: string;
    select_by?: string;
  }

  interface GoogleAccountsId {
    initialize: (opts: {
      client_id: string;
      callback: (resp: GoogleCredentialResponse) => void;
      ux_mode?: "popup" | "redirect";
      prompt_parent_id?: string;
    }) => void;
    renderButton: (element: HTMLElement, options?: Record<string, unknown>) => void;
    prompt?: (listener?: (notification: any) => void) => void;
  }

  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}
