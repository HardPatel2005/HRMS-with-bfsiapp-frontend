interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleAccountId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  prompt: () => void;
}

interface GoogleAccounts {
  id: GoogleAccountId;
}

interface GoogleNamespace {
  accounts: GoogleAccounts;
}

interface Window {
  google?: GoogleNamespace;
}
