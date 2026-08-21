/**
 * Every user-facing string lives in `src/content/*`, typed `as const` — no
 * inline copy in components. The app is Bosnian only; there is no i18n
 * framework and `<html lang="bs">`.
 *
 * When addressing the user directly the formal pronoun is capitalised:
 * Vi, Vas, Vam, Vaš / Vaša / Vaše.
 */
export const common = {
  appName: 'Soapbox',
  appTagline: 'Sistem bodovanja',
  loading: 'Učitavanje…',
  save: 'Spremi',
  cancel: 'Odustani',
  close: 'Zatvori',
  delete: 'Obriši',
  edit: 'Izmijeni',
  add: 'Dodaj',
  confirm: 'Potvrdi',
  retry: 'Pokušajte ponovo',
  signOut: 'Odjava',
  genericError: 'Došlo je do greške. Pokušajte ponovo.',
  offline: 'Nema veze sa serverom.',
  showPassword: 'Prikaži lozinku',
  hidePassword: 'Sakrij lozinku',
  none: '—',
} as const;

export const criteria = {
  vehicle: 'Kreativnost izrade vozila',
  performance: 'Kreativnost nastupa',
  time: 'Prolazno vrijeme',
} as const;

/** Short forms for table headers, where the full name will not fit. */
export const criteriaShort = {
  vehicle: 'Vozilo',
  performance: 'Nastup',
  time: 'Vrijeme',
} as const;

export const roles = {
  admin: 'Administrator',
  referee: 'Sudija',
} as const;
