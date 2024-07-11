import {
  envsafe,
  str,
} from 'envsafe'

export const serverEnv = {
  ...envsafe({
    DATABASE_URL: str(),
    GITHUB_ID: str(),
    GITHUB_SECRET: str(),
    GITHUB_ALLOWED_ORG: str(),
    UPLOADTHING_SECRET: str(),
    UPLOADTHING_APP_ID: str()
  }),
}
