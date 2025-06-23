// App
export interface App {
  name: string;
  collaborators: {
    [email: string]: {
      permission: string;
      isCurrentAccount?: boolean;
    };
  };
  deployments: string[];
  os?: string;
  platform?: string;
}

// Deployment
export interface Package {
  description: string;
  isDisabled: boolean;
  isMandatory: boolean;
  rollout: number;
  appVersion: string;
  packageHash: string;
  blobUrl: string;
  size: number;
  manifestBlobUrl: string;
  releaseMethod: string;
  uploadTime: number;
  label: string;
  releasedBy: string;
}

export interface Deployment {
  name: string;
  key: string;
  id: string;
  package: Package | null;
}

// UI
export interface Option {
  value: string;
  label: string;
} 