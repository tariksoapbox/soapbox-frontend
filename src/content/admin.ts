export const admin = {
  title: 'Administracija',
  tabs: {
    standings: 'Rang lista',
    teams: 'Ekipe',
    scores: 'Ocjene',
    users: 'Korisnici',
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
  scores: {
    title: 'Poslane ocjene',
    subtitle: 'Ko je poslao ocjenu, a ko još nije. Ovdje ispravljate greške sudija.',
    pending: 'Čeka',
    noJudges: 'Nema aktivnih sudija. Kreirajte ih u kartici "Korisnici".',
    empty: 'Još nema ekipa.',
    clear: 'Poništi ocjenu',
    cleared: 'Ocjena je poništena. Sudija je sada može poslati ponovo.',
    confirmClearTitle: 'Poništiti ocjenu?',
    confirmClear: (judge: string, team: string, points: number) =>
      `Ocjena ${points}, koju je sudija ${judge} poslao za ekipu "${team}", biće obrisana. Sudija će je moći poslati ponovo.`,
  },
  users: {
    title: 'Korisnici',
    subtitle: 'Kreirajte sudije i administratore. Sudije se ne mogu registrovati same.',
    add: 'Novi korisnik',
    addTitle: 'Novi korisnik',
    displayName: 'Ime i prezime',
    username: 'Korisničko ime',
    usernameHelp: 'Mala slova, brojevi te . _ - — bez razmaka.',
    password: 'Lozinka',
    passwordHelp: 'Najmanje 8 znakova.',
    role: 'Uloga',
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
    // Deactivating a judge changes the denominator of every "x / y sudija".
    judgeCountNotice:
      'Broj aktivnih sudija određuje kada je kriterij kompletan. Deaktivirani sudija se ne broji, a njegove ocjene se ne računaju.',
  },
} as const;
