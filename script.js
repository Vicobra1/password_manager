const STORAGE_KEY = 'kobra-passwords';
const CATEGORIES = ['Personnel', 'Travail', 'Réseaux sociaux', 'Banque', 'Autre'];
const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const elements = {
  list: document.getElementById('password-list'),
  count: document.getElementById('password-count'),
  summary: document.getElementById('list-summary'),
  search: document.getElementById('search-input'),
  filter: document.getElementById('category-filter'),
  dialog: document.getElementById('credential-dialog'),
  form: document.getElementById('credential-form'),
  dialogTitle: document.getElementById('dialog-title'),
  site: document.getElementById('site-name'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  generated: document.getElementById('generated-password'),
  toast: document.getElementById('toast')
};

let credentials = loadCredentials();
let editingId = null;
let toastTimer;
let hideTimer;
let visiblePasswords = new Set();

function loadCredentials() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter(item => item && typeof item === 'object').map(item => ({
      id: item.id || crypto.randomUUID(),
      site: String(item.site || ''),
      username: String(item.username || ''),
      password: String(item.password || ''),
      notes: String(item.notes || ''),
      category: CATEGORIES.includes(item.category) ? item.category : 'Autre',
      date: item.date || new Date().toISOString()
    }));
  } catch {
    return [];
  }
}

function saveCredentials() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    return true;
  } catch {
    showToast('Impossible d’enregistrer les données dans ce navigateur.', 'error');
    return false;
  }
}

function showToast(message, type = 'success') {
  elements.toast.textContent = message;
  elements.toast.className = `toast is-visible ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('is-visible'), 2800);
}

function setSection(sectionId) {
  const names = { coffre: 'Coffre', generateur: 'Générateur', parametres: 'Paramètres' };
  document.querySelectorAll('.nav-link').forEach(button => {
    const active = button.dataset.target === sectionId;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('.content-section').forEach(section => {
    const active = section.id === sectionId;
    section.classList.toggle('active', active);
    section.hidden = !active;
  });
  document.getElementById('current-section-name').textContent = names[sectionId] || 'Coffre';
}

function makeButton(label, action, className = 'button button-quiet', title = label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.action = action;
  button.textContent = label;
  button.title = title;
  return button;
}

function renderCredentials() {
  const query = elements.search.value.trim().toLocaleLowerCase('fr');
  const category = elements.filter.value;
  const filtered = credentials.filter(item => {
    const matchesText = [item.site, item.username, item.notes].some(value => value.toLocaleLowerCase('fr').includes(query));
    return matchesText && (!category || item.category === category);
  });

  elements.list.replaceChildren();
  elements.count.textContent = String(credentials.length);
  elements.summary.textContent = filtered.length === credentials.length
    ? `${credentials.length} ${credentials.length === 1 ? 'identifiant' : 'identifiants'}`
    : `${filtered.length} affiché${filtered.length === 1 ? '' : 's'} sur ${credentials.length}`;

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = query || category ? '⌕' : '▤';
    const title = document.createElement('h3');
    title.textContent = query || category ? 'Aucun résultat' : 'Votre coffre est vide';
    const description = document.createElement('p');
    description.textContent = query || category
      ? 'Essayez un autre terme ou une autre catégorie.'
      : 'Ajoutez votre premier identifiant pour commencer à explorer le projet.';
    empty.append(icon, title, description);
    if (!query && !category) empty.append(makeButton('＋ Ajouter un identifiant', 'add', 'button button-primary'));
    elements.list.append(empty);
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('article');
    card.className = 'credential-card';
    const mark = document.createElement('div');
    mark.className = 'site-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = (item.site.trim()[0] || '?').toLocaleUpperCase('fr');

    const details = document.createElement('div');
    details.className = 'credential-details';
    const title = document.createElement('h3');
    title.textContent = item.site;
    const user = document.createElement('p');
    user.className = 'credential-username';
    user.textContent = item.username;
    const categoryTag = document.createElement('span');
    categoryTag.className = 'category-tag';
    categoryTag.textContent = item.category;
    details.append(title, user, categoryTag);

    const secret = document.createElement('div');
    secret.className = 'credential-secret';
    const passwordLabel = document.createElement('span');
    passwordLabel.className = 'secret-label';
    passwordLabel.textContent = 'MOT DE PASSE';
    const passwordText = document.createElement('code');
    passwordText.textContent = visiblePasswords.has(item.id) ? item.password : '••••••••••••';
    secret.append(passwordLabel, passwordText);

    const actions = document.createElement('div');
    actions.className = 'credential-actions';
    const reveal = makeButton(visiblePasswords.has(item.id) ? 'Masquer' : 'Afficher', 'toggle', 'button button-quiet button-small');
    const copy = makeButton('Copier', 'copy', 'button button-quiet button-small');
    const edit = makeButton('Modifier', 'edit', 'button button-quiet button-small');
    const remove = makeButton('Supprimer', 'delete', 'button button-danger button-small');
    [reveal, copy, edit, remove].forEach(button => { button.dataset.id = item.id; });
    actions.append(reveal, copy, edit, remove);
    card.append(mark, details, secret, actions);
    elements.list.append(card);
  });
}

function openCredentialDialog(item = null) {
  editingId = item?.id || null;
  elements.dialogTitle.textContent = editingId ? 'Modifier un identifiant' : 'Ajouter un identifiant';
  elements.form.elements.site.value = item?.site || '';
  elements.form.elements.username.value = item?.username || '';
  elements.form.elements.password.value = item?.password || '';
  elements.form.elements.category.value = item?.category || 'Personnel';
  elements.form.elements.notes.value = item?.notes || '';
  elements.dialog.showModal();
  requestAnimationFrame(() => elements.site.focus());
}

function closeCredentialDialog() {
  elements.dialog.close();
  elements.form.reset();
  editingId = null;
}

function randomIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value); while (value[0] >= limit);
  return value[0] % max;
}

function generatePassword() {
  const length = Number(document.getElementById('length').value);
  const selectedSets = Object.entries(CHARACTER_SETS)
    .filter(([key]) => document.getElementById(key).checked)
    .map(([, characters]) => characters);
  if (selectedSets.length === 0) {
    showToast('Sélectionnez au moins un type de caractère.', 'error');
    return '';
  }
  const allCharacters = selectedSets.join('');
  const password = selectedSets.map(set => set[randomIndex(set.length)]);
  while (password.length < length) password.push(allCharacters[randomIndex(allCharacters.length)]);
  for (let index = password.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1);
    [password[index], password[other]] = [password[other], password[index]];
  }
  const result = password.join('');
  elements.generated.value = result;
  return result;
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const temporary = document.createElement('textarea');
      temporary.value = text;
      temporary.setAttribute('readonly', '');
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      document.body.append(temporary);
      temporary.select();
      const copied = document.execCommand('copy');
      temporary.remove();
      if (!copied) throw new Error('Clipboard unavailable');
    }
    showToast('Mot de passe copié.');
  } catch {
    showToast('Copie impossible dans ce navigateur.', 'error');
  }
}

function startHideTimer() {
  clearTimeout(hideTimer);
  const minutes = Number(localStorage.getItem('auto-lock-time') || 5);
  if (minutes > 0) {
    hideTimer = setTimeout(() => {
      visiblePasswords.clear();
      renderCredentials();
      showToast('Les mots de passe affichés ont été masqués.');
    }, minutes * 60_000);
  }
}

function exportCredentials() {
  if (!confirm('Le fichier exporté contiendra les mots de passe en clair. Ne le partagez pas. Continuer ?')) return;
  const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kobra-passwords-backup.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Sauvegarde téléchargée. Protégez ce fichier.');
}

function importCredentials(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data) || !data.every(item => item && typeof item.site === 'string' && typeof item.username === 'string' && typeof item.password === 'string')) {
        throw new Error('Format non reconnu');
      }
      if (!confirm(`Importer ${data.length} identifiant(s) et remplacer le contenu actuel du coffre ?`)) return;
      credentials = data.map(item => ({
        id: item.id || crypto.randomUUID(),
        site: item.site.slice(0, 100),
        username: item.username.slice(0, 150),
        password: item.password.slice(0, 512),
        notes: typeof item.notes === 'string' ? item.notes.slice(0, 1000) : '',
        category: CATEGORIES.includes(item.category) ? item.category : 'Autre',
        date: item.date || new Date().toISOString()
      }));
      visiblePasswords.clear();
      if (saveCredentials()) { renderCredentials(); showToast('Importation terminée.'); }
    } catch {
      showToast('Ce fichier ne contient pas une sauvegarde Kobra valide.', 'error');
    }
  };
  reader.readAsText(file);
}

document.querySelectorAll('.nav-link').forEach(button => button.addEventListener('click', () => setSection(button.dataset.target)));
document.getElementById('add-credential').addEventListener('click', () => openCredentialDialog());
document.getElementById('close-dialog').addEventListener('click', closeCredentialDialog);
document.getElementById('cancel-dialog').addEventListener('click', closeCredentialDialog);
elements.dialog.addEventListener('click', event => { if (event.target === elements.dialog) closeCredentialDialog(); });

elements.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const site = String(formData.get('site')).trim();
  const username = String(formData.get('username')).trim();
  const password = String(formData.get('password'));
  if (!site || !username || !password.trim()) { showToast('Remplissez les champs obligatoires.', 'error'); return; }
  const wasEditing = Boolean(editingId);
  const existing = wasEditing ? credentials.find(item => item.id === editingId) : null;
  const updated = {
    id: editingId || crypto.randomUUID(), site, username, password,
    category: CATEGORIES.includes(formData.get('category')) ? formData.get('category') : 'Autre',
    notes: String(formData.get('notes')).trim(), date: existing?.date || new Date().toISOString()
  };
  if (wasEditing) credentials = credentials.map(item => item.id === editingId ? updated : item);
  else credentials.unshift(updated);
  if (saveCredentials()) {
    closeCredentialDialog(); renderCredentials();
    showToast(wasEditing ? 'Identifiant mis à jour.' : 'Identifiant ajouté au coffre.');
  }
});

elements.list.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'add') return openCredentialDialog();
  const item = credentials.find(entry => entry.id === button.dataset.id);
  if (!item) return;
  switch (button.dataset.action) {
    case 'toggle':
      if (visiblePasswords.has(item.id)) visiblePasswords.delete(item.id);
      else { visiblePasswords.add(item.id); startHideTimer(); }
      renderCredentials();
      break;
    case 'copy': await copyText(item.password); break;
    case 'edit': openCredentialDialog(item); break;
    case 'delete':
      if (confirm(`Supprimer l’identifiant « ${item.site} » ?`)) {
        credentials = credentials.filter(entry => entry.id !== item.id);
        visiblePasswords.delete(item.id);
        if (saveCredentials()) { renderCredentials(); showToast('Identifiant supprimé.'); }
      }
      break;
  }
});

elements.search.addEventListener('input', renderCredentials);
elements.filter.addEventListener('change', renderCredentials);
document.getElementById('length').addEventListener('input', event => { document.getElementById('length-value').textContent = event.target.value; });
document.getElementById('generate-password').addEventListener('click', generatePassword);
document.getElementById('generate-for-vault').addEventListener('click', () => { const password = generatePassword(); if (password) elements.password.value = password; });
document.getElementById('copy-generated').addEventListener('click', () => {
  if (elements.generated.value) copyText(elements.generated.value);
  else showToast('Générez d’abord un mot de passe.', 'error');
});
document.getElementById('use-generated').addEventListener('click', () => {
  if (!elements.generated.value) generatePassword();
  if (elements.generated.value) openCredentialDialog({ password: elements.generated.value });
});

function getPreferredTheme() {
  return localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  document.getElementById('dark-mode').checked = theme === 'dark';
}
document.getElementById('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
document.getElementById('dark-mode').addEventListener('change', event => setTheme(event.target.checked ? 'dark' : 'light'));
document.getElementById('auto-lock').addEventListener('change', event => {
  localStorage.setItem('auto-lock-time', event.target.value);
  if (visiblePasswords.size) startHideTimer();
  showToast('Préférence mise à jour.');
});
document.getElementById('export-data').addEventListener('click', exportCredentials);
document.getElementById('import-data').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json,application/json';
  input.addEventListener('change', () => importCredentials(input.files[0]), { once: true });
  input.click();
});

setTheme(getPreferredTheme());
document.getElementById('auto-lock').value = localStorage.getItem('auto-lock-time') || '5';
renderCredentials();
