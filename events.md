# Tracking Events

- init

  - success: user id
  - error: message string

- clear

  - avatars: user id
  - app: user id
  - auth: user id

- logout

  - user: user id

- login

  - {method}: username
  - getMeError: message string
  - verifyEmailError: message string
  - verifyOtpError: message string

- avatar

  - {error message}: user id
  - fetch: avatar id
  - userFetch: user id
  - notFound: avatar id
  - public: {author_id:avatar_id}

  - add: avatar id
  - userAdd: user id

  - open: avatar id
  - userOpen: user id

  - copy: avatar id
  - userCopy: user id

  - delete: avatar id
  - userDelete: user id

  - userExport: user id
  - exportSize: avatar export size
  - exportFileFormat: txt, csv
  - exportDateFormat: ISO, FRIENDLY

  - userImport: user id
  - importSize: avatar import size
  - importExists: import existing avatar size

- tag

  - set: tag string
  - filter: tag string

- author

  - open: author id
  - userOpen: user id

- settings

  - theme: dark, light, system
  - autoStart: on, off
