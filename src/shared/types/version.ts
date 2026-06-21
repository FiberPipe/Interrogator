export interface VersionConfig {
  alpha: ChannelConfig;
  beta: ChannelConfig;
  buildNumber: number;
  lastBuild: string;
}

export interface ChannelConfig {
  version: string;
  channel: 'production' | 'testing';
  autoUpdate: boolean;
  description: string;
}

export type BuildChannel = 'alpha' | 'beta';
