import versionConfig from '../../../version.config.json';

export const getAppVersion = (): string => {
  const channel = process.env.BUILD_CHANNEL || 'alpha';
  return versionConfig[channel as 'alpha' | 'beta'].version;
};

export const getBuildChannel = (): string => {
  return process.env.BUILD_CHANNEL || 'alpha';
};

export const isProductionBuild = (): boolean => {
  return getBuildChannel() === 'alpha';
};

export const isBetaBuild = (): boolean => {
  return getBuildChannel() === 'beta';
};
