export const admin = {
  title: 'Administracija',
  tabs: {
    standings: 'Rang lista',
    teams: 'Ekipe',
    scores: 'Ocjene',
    judges: 'Sudije',
    users: 'Administratori',
  },
  teams: {
    title: 'Ekipe i prolazna vremena',
    subtitle: 'Imenujte ekipe i unesite prolazno vrijeme nakon svake vožnje.',
    add: 'Dodaj ekipu',
    name: 'Naziv ekipe',
    bib: 'Startni broj',
    bibOptional: 'Startni broj (opcionalno)',
    runTime: 'Prolazno vrijeme',
    runTimeHelp: 'Oblik m:ss.SS — npr. 1:57.42. Može i samo sekunde: 117.42.',
    runTimePlaceholder: '1:57.42',
    saveName: 'Spremi naziv',
    saveTime: 'Spremi vrijeme',
    clearTime: 'Obriši vrijeme',
    empty: 'Još nema ekipa. Dodajte prvu.',
    created: (name: string) => `Ekipa "${name}" je dodana.`,
    renamed: 'Ekipa je izmijenjena.',
    timeSaved: (name: string) => `Vrijeme za "${name}" je spremljeno.`,
    timeCleared: (name: string) => `Vrijeme za "${name}" je obrisano.`,
    deleted: 'Ekipa je obrisana.',
    confirmDeleteTitle: 'Obrisati ekipu?',
    confirmDelete: (name: string) =>
      `Brisanjem ekipe "${name}" trajno se brišu i sve ocjene koje su sudije poslale za nju.`,
  },
  judges: {
    title: 'Sudije',
    subtitle:
      'Sudije se ne prijavljuju u aplikaciju — ocjenjuju na papiru, a Vi unosite ocjene. Zato sudija ima samo ime.',
    add: 'Dodaj sudiju',
    name: 'Ime i prezime sudije',
    active: 'Aktivan',
    inactive: 'Neaktivan',
    activate: 'Vrati u žiri',
    deactivate: 'Ukloni iz žirija',
    empty: 'Još nema sudija. Dodajte ih prije prve vožnje.',
    // The active count is the denominator of every "3 / 5 sudija".
    countNotice:
      'Broj aktivnih sudija određuje kada je kriterij kompletan. Neaktivan sudija se ne broji, a njegove ocjene se ne računaju.',
    editSafeNotice:
      'Preimenovanje sudije ne utiče na već unesene ocjene. Brisanje sudije briše i sve njegove ocjene.',
    confirmDeleteTitle: 'Obrisati sudiju?',
    confirmDelete: (name: string) =>
      `Brisanjem sudije "${name}" trajno se brišu i sve ocjene koje su za njega unesene. Ako ga samo ne želite više u žiriju, uklonite ga iz žirija.`,
  },
  scores: {
    title: 'Unos ocjena',
    subtitle:
      'Otvorite kriterij za ekipu i unesite ocjenu svakog sudije. Ocjene možete mijenjati koliko god puta treba.',
    noJudges: 'Nema aktivnih sudija. Dodajte ih u kartici "Sudije".',
    empty: 'Još nema ekipa. Dodajte ih u kartici "Ekipe".',
    enter: 'Unesi ocjene',
    edit: 'Izmijeni ocjene',
    pending: 'Nije uneseno',
    of: (entered: number, expected: number) => `${entered}/${expected} uneseno`,
    dialogTitle: (criterion: string, team: string) => `${criterion} — ${team}`,
    dialogHelp: 'Unesite ocjenu (1–10) za svakog sudiju. Prazno znači da ocjena još nije unesena.',
    clear: 'Obriši',
    cleared: 'Ocjena je obrisana.',
    saved: 'Ocjene su spremljene.',
    total: 'Ukupno',
  },
  users: {
    title: 'Administratori',
    subtitle:
      'Računi za prijavu u aplikaciju. Samo administratori se prijavljuju — sudije nemaju račun.',
    add: 'Novi administrator',
    addTitle: 'Novi administrator',
    displayName: 'Ime i prezime',
    username: 'Korisničko ime',
    usernameHelp: 'Mala slova, brojevi te . _ - — bez razmaka.',
    password: 'Lozinka',
    passwordHelp: 'Najmanje 8 znakova.',
    active: 'Aktivan',
    inactive: 'Deaktiviran',
    created: (name: string) => `Korisnik "${name}" je kreiran.`,
    activate: 'Aktiviraj',
    deactivate: 'Deaktiviraj',
    activated: 'Korisnik je aktiviran.',
    deactivated: 'Korisnik je deaktiviran i odmah odjavljen.',
    edit: 'Izmijeni',
    editTitle: 'Izmjena korisnika',
    saved: 'Izmjene su spremljene.',
    // The password field is blank on open and means "leave it as it is". The
    // consequence line only appears once something has actually been typed.
    newPassword: 'Nova lozinka',
    newPasswordHelp: 'Ostavite prazno da zadržite postojeću lozinku.',
    passwordWillSignOut:
      'Promjenom lozinke korisnik će biti odmah odjavljen i mora se prijaviti novom lozinkom.',
    // Renaming is safe and deleting is not — say why, next to the delete button.
    editSafeNotice:
      'Izmjena podataka ne utiče na već poslane ocjene. Brisanje korisnika briše i sve njegove ocjene.',
    deleted: 'Korisnik je obrisan.',
    confirmDeleteTitle: 'Obrisati korisnika?',
    confirmDelete: (name: string) =>
      `Brisanjem korisnika "${name}" trajno se brišu i sve ocjene koje je poslao.`,
    you: 'Vi',
    lastAdminNotice:
      'Mora postojati barem jedan aktivan administrator — inače se niko ne može prijaviti.',
  },
} as const;
