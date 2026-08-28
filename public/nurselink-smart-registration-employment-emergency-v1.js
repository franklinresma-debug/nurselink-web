(() => {
  'use strict';

  const API = 'https://api.amsertech.com/api/smart-registration';
  const fields = [
    ['employment_countries', 'Country / Countries of Employment (Current and Previous)', 'Philippines; Saudi Arabia; United Kingdom'],
    ['healthcare_facility_names', 'Hospital / Healthcare Facility Names (Current and Previous)', 'List facilities or employers'],
    ['employment_positions', 'Position / Designation (Current and Previous)', 'Staff Nurse; Charge Nurse; ICU Nurse'],
    ['emergency_contact_name_relationship', 'Emergency Contact — Name and Relationship', 'Maria Santos — Spouse'],
    ['emergency_contact_phone', 'Emergency Contact Number', '+63 9XX XXX XXXX']
  ];

  let profile = null;
  let profileRequest = null;

  async function loadProfile() {
    if (profile) return profile;
    if (!profileRequest) {
      profileRequest = fetch(API, { credentials: 'include' })
        .then(response => response.ok ? response.json() : null)
        .then(payload => {
          profile = payload?.data?.profile || {};
          return profile;
        })
        .catch(() => ({}));
    }
    return profileRequest;
  }

  function field(name, label, placeholder, value) {
    const wrap = document.createElement('label');
    wrap.className = 'nurselink-smart557-field';

    const caption = document.createElement('span');
    caption.textContent = label;
    const input = document.createElement('input');
    input.name = name;
    input.type = name === 'emergency_contact_phone' ? 'tel' : 'text';
    input.placeholder = placeholder;
    input.autocomplete = name === 'emergency_contact_phone' ? 'tel' : 'off';
    input.value = String(value || '');

    wrap.append(caption, input);
    return wrap;
  }

  async function enhanceForm(form) {
    if (form.querySelector('[data-smart-employment-emergency]')) return;

    const values = await loadProfile();
    if (!form.isConnected || form.querySelector('[data-smart-employment-emergency]')) return;

    const group = document.createElement('section');
    group.className = 'nurselink-smart557-field-group';
    group.dataset.smartEmploymentEmergency = '1';

    const employmentTitle = document.createElement('strong');
    employmentTitle.textContent = 'Employment History';
    const employmentHelp = document.createElement('small');
    employmentHelp.textContent = 'List current and previous employment details. Separate entries with commas or semicolons.';
    group.append(employmentTitle, employmentHelp);
    fields.slice(0, 3).forEach(([name, label, placeholder]) => group.append(field(name, label, placeholder, values[name])));

    const emergencyTitle = document.createElement('strong');
    emergencyTitle.textContent = 'Emergency Contact';
    const emergencyHelp = document.createElement('small');
    emergencyHelp.textContent = 'Private to you and authorized NurseLink support and reviewers. It is never displayed on a public profile.';
    const emergencyGrid = document.createElement('div');
    emergencyGrid.className = 'nurselink-smart557-grid two';
    fields.slice(3).forEach(([name, label, placeholder]) => emergencyGrid.append(field(name, label, placeholder, values[name])));
    group.append(emergencyTitle, emergencyHelp, emergencyGrid);

    const anchor = form.querySelector('[name="specialty"]')?.closest('label, .nurselink-smart557-grid');
    anchor?.parentNode?.insertBefore(group, anchor);
  }

  function enhance() {
    document.querySelectorAll('form[data-smart-form="professional"]').forEach(enhanceForm);
  }

  document.addEventListener('DOMContentLoaded', enhance);
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
})();
