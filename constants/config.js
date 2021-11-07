const urls = {
  PROD: 'https://api.bandhify.com/',
  STAGING: 'https://testapi.bandhify.com/',
};

export const ENVS = {
  PROD: 'PROD',
  STAGING: 'STAGING',
};

export const AppConfig = ENVS.PROD;

const BASE_URL = AppConfig === ENVS.PROD ? urls.PROD : urls.STAGING;

export default BASE_URL;
