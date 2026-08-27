(() => {
  'use strict';
  const STORAGE_KEY = 'nurselink_admin_theme';
  const root = document.documentElement;
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');

  const icon = {
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>',
    system: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path></svg>'
  };

  function preferredTheme(mode) {
    if (mode === 'dark' || mode === 'light') return mode;
    return media?.matches ? 'dark' : 'light';
  }

  function readMode() {
    try { return localStorage.getItem(STORAGE_KEY) || 'system'; } catch (_) { return 'system'; }
  }

  function updateThemeControl(mode) {
    const control = document.querySelector('.nl632-theme-control');
    if (!control) return;
    const actual = preferredTheme(mode);
    const toggle = control.querySelector('[data-nl632-theme-toggle]');
    const system = control.querySelector('[data-nl632-theme-system]');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(actual === 'dark'));
      toggle.setAttribute('aria-label', actual === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.title = actual === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
    if (system) {
      const active = mode === 'system';
      system.setAttribute('aria-pressed', String(active));
      system.title = active ? 'System theme is active' : 'Use system theme';
    }
    control.dataset.mode = mode;
    control.dataset.actualTheme = actual;
  }

  function applyTheme(mode, save = false) {
    const safe = ['light', 'dark', 'system'].includes(mode) ? mode : 'system';
    root.dataset.nlTheme = preferredTheme(safe);
    root.dataset.nlThemeMode = safe;
    updateThemeControl(safe);
    if (save) {
      try { localStorage.setItem(STORAGE_KEY, safe); } catch (_) {}
    }
  }

  function addThemeControl() {
    if (document.querySelector('.nl632-theme-control')) return;
    document.querySelector('.nl631-theme-control')?.remove();
    const topbar = document.querySelector('.nl530-topbar');
    if (!topbar) return;

    const control = document.createElement('div');
    control.className = 'nl632-theme-control';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Appearance');
    control.innerHTML = `
      <button class="nl632-theme-icon nl632-light-button" type="button" data-nl632-theme-light aria-label="Use light mode" title="Light mode">${icon.sun}</button>
      <button class="nl632-theme-switch" type="button" role="switch" data-nl632-theme-toggle aria-checked="false"><span class="nl632-theme-switch-knob"></span></button>
      <button class="nl632-theme-icon nl632-dark-button" type="button" data-nl632-theme-dark aria-label="Use dark mode" title="Dark mode">${icon.moon}</button>
      <span class="nl632-theme-divider" aria-hidden="true"></span>
      <button class="nl632-theme-icon nl632-system-button" type="button" data-nl632-theme-system aria-pressed="false" aria-label="Use system theme" title="Use system theme">${icon.system}</button>`;

    control.addEventListener('click', event => {
      if (event.target.closest('[data-nl632-theme-light]')) return applyTheme('light', true);
      if (event.target.closest('[data-nl632-theme-dark]')) return applyTheme('dark', true);
      if (event.target.closest('[data-nl632-theme-system]')) return applyTheme('system', true);
      if (event.target.closest('[data-nl632-theme-toggle]')) {
        const current = root.dataset.nlTheme || preferredTheme(readMode());
        return applyTheme(current === 'dark' ? 'light' : 'dark', true);
      }
    });

    topbar.appendChild(control);
    applyTheme(readMode());
  }

  function groupSidebar() {
    const menu = document.querySelector('.nl530-menu');
    if (!menu || menu.dataset.nl631Grouped === '1') return;
    const groups = [
      ['dashboard', 'Overview'],
      ['members', 'Membership'],
      ['programs', 'Programs'],
      ['communications', 'Operations'],
      ['audit', 'System']
    ];
    groups.forEach(([tab, label]) => {
      const link = menu.querySelector(`[data-tab="${tab}"]`);
      if (!link) return;
      const heading = document.createElement('div');
      heading.className = 'nl631-menu-label';
      heading.textContent = label;
      link.before(heading);
    });
    menu.dataset.nl631Grouped = '1';
  }

  function simplifySecondaryDashboard() {
    const dashboard = document.querySelector('[data-panel="dashboard"]');
    if (!dashboard) return;
    dashboard.querySelectorAll('.nl530-grid-2').forEach(grid => {
      const headings = [...grid.querySelectorAll('h2')].map(el => el.textContent.trim());
      if (headings.includes('Administrator Follow-up')) grid.classList.add('nl631-secondary-dashboard');
      if (headings.includes('Administration Model')) {
        const model = [...grid.querySelectorAll('.nl530-card')].find(card => card.querySelector('h2')?.textContent.trim() === 'Administration Model');
        if (model) model.dataset.nl631AdminModel = '1';
      }
    });
  }



  function modernizeMembershipModules() {
    const membersPanel = document.querySelector('[data-panel="members"]');
    if (membersPanel) membersPanel.dataset.nl640Modern = '1';

    const applicationsPanel = document.querySelector('[data-panel="applications"]');
    if (applicationsPanel) applicationsPanel.dataset.nl640Modern = '1';

    const workload = document.getElementById('applicationWorkloadSection');
    if (workload && workload.dataset.nl640Ready !== '1') {
      workload.dataset.nl640Ready = '1';
      workload.dataset.nl640Collapsed = '1';
      const heading = workload.querySelector('.nl552-workload-heading');
      if (heading) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nl640-workload-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Show reviewer workload';
        toggle.addEventListener('click', () => {
          const collapsed = workload.dataset.nl640Collapsed === '1';
          workload.dataset.nl640Collapsed = collapsed ? '0' : '1';
          toggle.setAttribute('aria-expanded', String(collapsed));
          toggle.textContent = collapsed ? 'Hide reviewer workload' : 'Show reviewer workload';
        });
        heading.appendChild(toggle);
      }
    }
  }



  function modernizeVerificationOrganizations() {
    const verification = document.querySelector('[data-panel="verification"]');
    if (verification && verification.dataset.nl650Modern !== '1') {
      verification.dataset.nl650Modern = '1';
      const toolbar = verification.querySelector('.nl530-toolbar');
      if (toolbar && !verification.querySelector('.nl650-section-intro')) {
        const intro = document.createElement('div');
        intro.className = 'nl650-section-intro';
        intro.innerHTML = '<span>Credential Review</span><h2>Verification Workspace</h2><p>Review professional credentials, inspect available evidence and record an auditable verification decision.</p>';
        toolbar.before(intro);
      }
    }

    const organizations = document.querySelector('[data-panel="organizations"]');
    if (organizations && organizations.dataset.nl650Modern !== '1') {
      organizations.dataset.nl650Modern = '1';
      if (!organizations.querySelector('.nl650-section-intro')) {
        const intro = document.createElement('div');
        intro.className = 'nl650-section-intro';
        intro.innerHTML = '<span>Institutional Partners</span><h2>Organization Registry</h2><p>Review and maintain hospitals, health systems, recruiters and other institutional partners through governed status workflows.</p>';
        organizations.prepend(intro);
      }
    }
  }


  function modernizeCommunicationsSupport() {
    const communications = document.querySelector('[data-panel="communications"]');
    if (communications && communications.dataset.nl670Modern !== '1') {
      communications.dataset.nl670Modern = '1';
      const grid = communications.querySelector('.nl530-grid-2');
      if (grid && !communications.querySelector('.nl670-section-intro')) {
        const intro = document.createElement('div');
        intro.className = 'nl670-section-intro';
        intro.innerHTML = '<span>Member Communications</span><h2>Controlled Notification Workspace</h2><p>Send a targeted in-app notification to one resolved NurseLink member through the existing governed communication workflow.</p>';
        grid.before(intro);

        const capabilities = document.createElement('div');
        capabilities.className = 'nl670-capability-grid';
        capabilities.innerHTML = [
          ['Audience','1 member','Resolved NurseLink identity'],
          ['Channel','In-app','Notification Center delivery'],
          ['Severity','4 levels','Information to Important'],
          ['Audit','Metadata','Sender, target and message metadata']
        ].map(row => `<div class="nl670-capability-card"><span>${row[0]}</span><strong>${row[1]}</strong><small>${row[2]}</small></div>`).join('');
        intro.after(capabilities);
      }
    }

    const support = document.querySelector('[data-panel="support"]');
    if (support && support.dataset.nl670Modern !== '1') {
      support.dataset.nl670Modern = '1';
      const grid = support.querySelector('.nl530-grid-support');
      if (grid && !support.querySelector('.nl670-section-intro')) {
        const intro = document.createElement('div');
        intro.className = 'nl670-section-intro';
        intro.innerHTML = '<span>Case Management</span><h2>Support Operations</h2><p>Prioritize open cases, ownership and resolution work while keeping new-case creation available as a secondary workflow.</p>';
        grid.before(intro);

        const summary = document.createElement('div');
        summary.className = 'nl670-support-summary';
        summary.id = 'nl670SupportSummary';
        summary.innerHTML = [
          ['Open','—','Active operational cases'],
          ['Urgent','—','Highest-priority cases'],
          ['Unassigned','—','Cases requiring ownership'],
          ['Resolved','—','Resolved or closed']
        ].map(row => `<div class="nl670-support-stat"><span>${row[0]}</span><strong>${row[1]}</strong><small>${row[2]}</small></div>`).join('');
        intro.after(summary);
      }

      const area = document.getElementById('supportArea');
      if (area && area.dataset.nl670Observed !== '1') {
        area.dataset.nl670Observed = '1';

        const updateSummary = () => {
          const forms = [...area.querySelectorAll('[data-support-case]')];
          const stats = {open:0, urgent:0, unassigned:0, resolved:0};
          forms.forEach(form => {
            const status = form.elements?.status?.value || '';
            const priority = form.elements?.priority?.value || '';
            const owner = form.elements?.assigned_admin_user_id?.value || '';
            if (!['resolved','closed'].includes(status)) stats.open += 1;
            if (priority === 'urgent') stats.urgent += 1;
            if (!owner && !['resolved','closed'].includes(status)) stats.unassigned += 1;
            if (['resolved','closed'].includes(status)) stats.resolved += 1;
          });

          const target = document.getElementById('nl670SupportSummary');
          if (!target) return;
          const values = [stats.open, stats.urgent, stats.unassigned, stats.resolved];
          [...target.querySelectorAll('strong')].forEach((el, index) => { el.textContent = String(values[index] ?? 0); });
        };

        const observer = new MutationObserver(() => window.setTimeout(updateSummary, 0));
        observer.observe(area, {childList:true, subtree:true});
        area.addEventListener('change', () => window.setTimeout(updateSummary, 0));
        window.setTimeout(updateSummary, 100);
      }
    }
  }


  function modernizeSystemAdministration() {
    const makeIntro = (panel, label, title, description) => {
      if (!panel || panel.querySelector(':scope > .nl680-intro')) return;
      const intro = document.createElement('div');
      intro.className = 'nl680-intro';
      intro.innerHTML = `<span>${label}</span><h2>${title}</h2><p>${description}</p>`;
      panel.prepend(intro);
    };

    const makeSummary = (panel, id, rows) => {
      let summary = panel?.querySelector(`#${id}`);
      if (!panel) return null;
      if (!summary) {
        summary = document.createElement('div');
        summary.className = 'nl680-summary';
        summary.id = id;
        summary.innerHTML = rows.map(row =>
          `<div class="nl680-stat"><span>${row[0]}</span><strong>${row[1]}</strong><small>${row[2]}</small></div>`
        ).join('');
        const intro = panel.querySelector(':scope > .nl680-intro');
        intro?.after(summary);
      }
      return summary;
    };

    const setSummary = (summary, values) => {
      if (!summary) return;
      [...summary.querySelectorAll('strong')].forEach((node, i) => {
        node.textContent = String(values[i] ?? '—');
      });
    };

    const observeArea = (area, update) => {
      if (!area || area.dataset.nl680Observed === '1') return;
      area.dataset.nl680Observed = '1';
      const observer = new MutationObserver(() => window.setTimeout(update, 0));
      observer.observe(area, {childList:true, subtree:true, attributes:true});
      area.addEventListener('change', () => window.setTimeout(update, 0));
      window.setTimeout(update, 120);
    };

    const reports = document.querySelector('[data-panel="reports"]');
    if (reports && reports.dataset.nl680Modern !== '1') {
      reports.dataset.nl680Modern = '1';
      makeIntro(reports, 'Analytics', 'Reports & Analytics',
        'Read the institutional snapshot first, then open managed analytics modules for deeper operational analysis.');
      const summary = makeSummary(reports, 'nl680ReportsSummary', [
        ['Metrics','—','Numeric snapshot metrics'],
        ['Modules','—','Managed analytics workspaces'],
        ['Source','Live','Institutional analytics API'],
        ['Mode','Governed','No direct database reporting']
      ]);
      const update = () => {
        const metrics = reports.querySelectorAll('#reportsArea .nl530-report-card').length;
        const modules = reports.querySelectorAll('#reportModules > *').length;
        setSummary(summary, [metrics, modules, 'Live', 'Governed']);
      };
      observeArea(document.getElementById('reportsArea'), update);
      observeArea(document.getElementById('reportModules'), update);
    }

    const audit = document.querySelector('[data-panel="audit"]');
    if (audit && audit.dataset.nl680Modern !== '1') {
      audit.dataset.nl680Modern = '1';
      makeIntro(audit, 'Accountability', 'Administrative Audit Log',
        'Review normalized administrator actions as an immutable operational activity stream.');
      const summary = makeSummary(audit, 'nl680AuditSummary', [
        ['Events','—','Loaded audit events'],
        ['Editing','Disabled','Activity is read-only'],
        ['Order','Newest','Recent operational activity first'],
        ['Scope','Normalized','Raw database state stays hidden']
      ]);
      const update = () => {
        const events = audit.querySelectorAll('#auditArea .nl530-audit').length;
        setSummary(summary, [events, 'Disabled', 'Newest', 'Normalized']);
      };
      observeArea(document.getElementById('auditArea'), update);
    }

    const health = document.querySelector('[data-panel="health"]');
    if (health && health.dataset.nl680Modern !== '1') {
      health.dataset.nl680Modern = '1';
      makeIntro(health, 'Platform Readiness', 'System Health',
        'Surface production problems first, then review healthy services and advanced operations tooling.');
      const summary = makeSummary(health, 'nl680HealthSummary', [
        ['Problems','—','Missing or attention states'],
        ['Available','—','Required services/tables available'],
        ['Modules','—','Advanced health workspaces'],
        ['Status','Checking','Current readiness signal']
      ]);
      const update = () => {
        const rows = [...health.querySelectorAll('#healthArea .nl530-health-row')];
        rows.sort((a,b) => Number(!a.querySelector('b.danger')) - Number(!b.querySelector('b.danger')));
        const table = health.querySelector('#healthArea .nl530-health-table');
        rows.forEach(row => table?.appendChild(row));
        const problems = rows.filter(row => row.querySelector('b.danger')).length;
        const available = rows.filter(row => row.querySelector('b.good')).length;
        const modules = health.querySelectorAll('#healthModules > *').length;
        setSummary(summary, [problems, available, modules, problems ? 'Attention' : 'Healthy']);
      };
      observeArea(document.getElementById('healthArea'), update);
      observeArea(document.getElementById('healthModules'), update);
    }

    const settings = document.querySelector('[data-panel="settings"]');
    if (settings && settings.dataset.nl680Modern !== '1') {
      settings.dataset.nl680Modern = '1';
      makeIntro(settings, 'Access Governance', 'Administrators',
        'Review active Administrator access first, then invitations, role changes and append-only governance history.');
      const summary = makeSummary(settings, 'nl680AdminSummary', [
        ['Administrators','—','Granular Administrator profiles'],
        ['Active','—','Active Administrator access'],
        ['Invitations','—','Pending invitations'],
        ['Governance','Protected','Server-enforced role controls']
      ]);
      const update = () => {
        const admins = [...settings.querySelectorAll('#settingsAccessArea .nl553-admin-row')];
        const active = admins.filter(row => /Active/i.test(row.textContent || '') && !/Revoked/i.test(row.textContent || '')).length;
        const invitations = settings.querySelectorAll('#adminInvitationArea .nl553-invitation-row').length;
        setSummary(summary, [admins.length, active, invitations, 'Protected']);
      };
      observeArea(document.getElementById('settingsAccessArea'), update);
      observeArea(document.getElementById('adminInvitationArea'), update);
    }
  }

  function init() {
    groupSidebar();
    addThemeControl();
    simplifySecondaryDashboard();
    modernizeMembershipModules();
    modernizeVerificationOrganizations();
    modernizeCommunicationsSupport();
    modernizeSystemAdministration();
    applyTheme(readMode());
  }

  media?.addEventListener?.('change', () => {
    if (readMode() === 'system') applyTheme('system');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
