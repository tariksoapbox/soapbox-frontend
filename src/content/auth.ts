export const auth = {
  title: 'Prijava',
  intro: 'Prijavite se korisničkim imenom i lozinkom koje ste dobili od administratora.',
  username: 'Korisničko ime',
  password: 'Lozinka',
  submit: 'Prijavi se',
  submitting: 'Prijava…',
  // There is no sign-up: an admin creates every account. Saying so on the login
  // screen stops judges hunting for a register link that does not exist.
  noSignUp: 'Nemate račun? Račune kreira isključivo administrator.',
  // The session is not persisted anywhere, so this is a real consequence the
  // judge needs to know before they close a tab mid-event.
  sessionNotice:
    'Prijava traje dok ne zatvorite aplikaciju. Nakon zatvaranja ili odjave prijavite se ponovo.',
  signedOut: 'Odjavljeni ste.',
  sessionExpired: 'Sesija je istekla. Prijavite se ponovo.',
} as const;
