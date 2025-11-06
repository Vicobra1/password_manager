// Handle navigation between sections with smooth transitions
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove active state from all navigation elements
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        // Set active state for clicked element
        this.classList.add('active');

        // Display the corresponding section
        const target = this.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
    });
});

// Password generator bindings
document.getElementById('generate-password').addEventListener('click', function() {
    generatePassword();
});

document.getElementById('generate-for-vault').addEventListener('click', function() {
    generatePassword();
    document.getElementById('password').value = document.getElementById('generated-password').textContent;
});

document.getElementById('length').addEventListener('input', function() {
    document.getElementById('length-value').textContent = this.value;
});

document.getElementById('copy-password').addEventListener('click', function() {
    const password = document.getElementById('generated-password').textContent;
    if (password !== "Your generated password will appear here...") {
        navigator.clipboard.writeText(password).then(() => {
            alert("Password copied to clipboard!");
        });
    }
});

// Generate password function
function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const uppercase = document.getElementById('uppercase').checked;
    const lowercase = document.getElementById('lowercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let allowedChars = '';
    let password = '';

    if (uppercase) allowedChars += uppercaseChars;
    if (lowercase) allowedChars += lowercaseChars;
    if (numbers) allowedChars += numberChars;
    if (symbols) allowedChars += symbolChars;

    // Ensure at least one character type is selected
    if (allowedChars.length === 0) {
        alert('Please select at least one character type!');
        return;
    }

    // Build password
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allowedChars.length);
        password += allowedChars[randomIndex];
    }

    document.getElementById('generated-password').textContent = password;
}

// Storage system for passwords
let passwords = JSON.parse(localStorage.getItem('kobra-passwords')) || [];

// Display stored passwords
function displayPasswords() {
    const passwordList = document.getElementById('password-list');
    const passwordCount = document.getElementById('password-count');

    passwordList.innerHTML = '';
    passwordCount.textContent = passwords.length;

    if (passwords.length === 0) {
        passwordList.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No passwords saved yet.</p>';
        return;
    }

    passwords.forEach((item, index) => {
        const passwordItem = document.createElement('div');
        passwordItem.className = 'password-item';
        passwordItem.innerHTML = `
            <h3>${item.site}</h3>
            <p><strong>User:</strong> ${item.username}</p>
            <p><strong>Password:</strong> <span class="password-hidden" id="password-${index}">${'•'.repeat(12)}</span></p>
            ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
            <div class="password-actions">
                <button class="btn btn-primary btn-small toggle-password" data-index="${index}">👁️ Show</button>
                <button class="btn btn-secondary btn-small copy-password" data-index="${index}">📋 Copy</button>
                <button class="btn btn-primary btn-small edit-password" data-index="${index}">✏️ Edit</button>
                <button class="btn btn-secondary btn-small delete-password" data-index="${index}">🗑️ Delete</button>
            </div>
        `;
        passwordList.appendChild(passwordItem);
    });

    // Attach events
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            togglePasswordVisibility(index);
        });
    });

    document.querySelectorAll('.copy-password').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            copyPassword(index);
        });
    });

    document.querySelectorAll('.edit-password').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            editPassword(index);
        });
    });

    document.querySelectorAll('.delete-password').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deletePassword(index);
        });
    });
}

// Toggle password visibility with master password protection
async function togglePasswordVisibility(index) {
    const passwordElement = document.getElementById(`password-${index}`);
    const button = document.querySelector(`.toggle-password[data-index="${index}"]`);

    if (passwordElement.classList.contains('password-hidden')) {
        if (!checkVaultAccess()) {
            const password = prompt('Enter master password to view passwords:');
            if (!password || !unlockVault(password)) {
                alert('Incorrect master password!');
                return;
            }
        }
        
        passwordElement.textContent = passwords[index].password;
        passwordElement.classList.remove('password-hidden');
        passwordElement.classList.add('password-visible');
        button.textContent = '🙈 Hide';
        
        resetAutoLockTimer();
    } else {
        passwordElement.textContent = '•'.repeat(12);
        passwordElement.classList.remove('password-visible');
        passwordElement.classList.add('password-hidden');
        button.textContent = '👁️ Show';
    }
}

// Copy one password
function copyPassword(index) {
    navigator.clipboard.writeText(passwords[index].password).then(() => {
        alert(`Password for ${passwords[index].site} copied!`);
    });
}

// Edit password
function editPassword(index) {
    const item = passwords[index];

    // Fill form with existing data
    document.getElementById('site-name').value = item.site;
    document.getElementById('username').value = item.username;
    document.getElementById('password').value = item.password;
    document.getElementById('notes').value = item.notes || '';

    // Remove from list so user can save edited entry
    passwords.splice(index, 1);

    // Update display and storage
    displayPasswords();
    savePasswords();

    alert(`Editing password for ${item.site}. Modify the fields and save again.`);
}

// Delete password
function deletePassword(index) {
    if (confirm(`Are you sure you want to delete the password for ${passwords[index].site}?`)) {
        passwords.splice(index, 1);
        displayPasswords();
        savePasswords();
    }
}

// Save to localStorage
function savePasswords() {
    localStorage.setItem('kobra-passwords', JSON.stringify(passwords));
}

// Save form data
document.getElementById('save-password').addEventListener('click', function() {
    const siteName = document.getElementById('site-name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const notes = document.getElementById('notes').value;

    if (!siteName || !username || !password) {
        alert('Please fill in all required fields!');
        return;
    }

    passwords.push({
        site: siteName,
        username: username,
        password: password,
        notes: notes,
        date: new Date().toISOString()
    });

    savePasswords();
    displayPasswords();

    // Reset form
    document.getElementById('site-name').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('notes').value = '';

    alert(`Credentials for ${siteName} saved successfully!`);
});

// Export data
document.getElementById('export-data').addEventListener('click', function() {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kobra-passwords-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Import data
document.getElementById('import-data').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);

                if (Array.isArray(importedData)) {
                    if (confirm(`Do you want to import ${importedData.length} passwords? This will overwrite your current data.`)) {
                        passwords = importedData;
                        savePasswords();
                        displayPasswords();
                        alert('Import successful!');
                    }
                } else {
                    alert('The file is not valid.');
                }
            } catch (error) {
                alert('Error during import: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
});

// Security and authentication management
let isLocked = true;
let autoLockTimer = null;
let masterPassword = localStorage.getItem('master-password');

// Function to check if vault access is allowed
function checkVaultAccess() {
    if (!masterPassword) {
        return true; // Allow access if no master password is set
    }
    return !isLocked;
}

// Function to lock the vault
function lockVault() {
    isLocked = true;
    document.querySelectorAll('.password-hidden').forEach(el => {
        el.textContent = '•'.repeat(12);
        el.classList.remove('password-visible');
        el.classList.add('password-hidden');
    });
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.textContent = '👁️ Show';
    });
}

// Function to unlock the vault
function unlockVault(password) {
    if (password === masterPassword) {
        isLocked = false;
        resetAutoLockTimer();
        return true;
    }
    return false;
}

// Function to reset auto-lock timer
function resetAutoLockTimer() {
    if (autoLockTimer) {
        clearTimeout(autoLockTimer);
    }
    
    const autoLockTime = parseInt(localStorage.getItem('auto-lock-time') || '5') * 60000; // Convert minutes to milliseconds
    if (autoLockTime > 0) {
        autoLockTimer = setTimeout(lockVault, autoLockTime);
    }
}

// Theme management
function getPreferredTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Theme toggle handler
document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// Save settings handler
document.getElementById('save-settings').addEventListener('click', function() {
    const newMasterPassword = document.getElementById('master-password').value;
    const autoLockTime = document.getElementById('auto-lock').value;
    const darkMode = document.getElementById('dark-mode').checked;
    
    // Save master password if provided
    if (newMasterPassword) {
        masterPassword = newMasterPassword;
        localStorage.setItem('master-password', masterPassword);
        lockVault(); // Lock vault when password changes
        alert('Master password updated. Vault is now locked.');
    }
    
    // Save auto-lock time
    localStorage.setItem('auto-lock-time', autoLockTime);
    console.log('Auto-lock time set to: ' + autoLockTime + ' minutes');
    
    // Save theme preference
    setTheme(darkMode ? 'dark' : 'light');
    
    // Clear master password field for security
    document.getElementById('master-password').value = '';
    
    alert('Settings saved successfully!');
});

// Initialize on load
window.addEventListener('load', function() {
    generatePassword();
    displayPasswords();
    
    // Initialize theme
    setTheme(getPreferredTheme());
    
    // Initialize settings form
    const autoLockTime = localStorage.getItem('auto-lock-time') || '5';
    document.getElementById('auto-lock').value = autoLockTime;
    document.getElementById('dark-mode').checked = getPreferredTheme() === 'dark';
    
    // Set initial lock state
    if (masterPassword) {
        lockVault();
    }
});
