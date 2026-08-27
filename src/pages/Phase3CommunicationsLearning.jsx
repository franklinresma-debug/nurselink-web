/* NurseLink Phase 3 Real Inbox + Professional Learning v4.1.0 */
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

async function nlRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(options.body && !(options.body instanceof FormData) ? {'Content-Type':'application/json'} : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const firstValidation = payload?.errors
      ? Object.values(payload.errors).flat().find(Boolean)
      : null;
    throw new Error(firstValidation || payload?.message || `Request failed (${response.status})`);
  }
  return payload;
}

function CardState({loading, error, empty, emptyTitle, emptyText, children}) {
  if (loading) return <div className="nl410-state">Loading…</div>;
  if (error) return <div className="nl410-state nl410-error" role="alert">{error}</div>;
  if (empty) return <div className="nl410-state"><strong>{emptyTitle}</strong><span>{emptyText}</span></div>;
  return children;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function unwrapInbox(payload) {
  const page = payload?.data;
  if (Array.isArray(page)) return page;
  if (Array.isArray(page?.data)) return page.data;
  return [];
}

export function Phase3MessagesPage() {
  const [payload,setPayload]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(null);
  const [selected,setSelected]=useState(null);
  const [prefs,setPrefs]=useState(null);
  const [prefsBusy,setPrefsBusy]=useState(false);
  const [prefsError,setPrefsError]=useState('');

  const load = useCallback(async()=>{
    setLoading(true); setError('');
    try {
      const [inbox, preferences] = await Promise.all([
        nlRequest('/api/messages'),
        nlRequest('/api/notification-preferences').catch(()=>null),
      ]);
      setPayload(inbox);
      if (preferences?.data) setPrefs(preferences);
    } catch(e) {
      setError(e?.message || 'Unable to load your inbox.');
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(()=>{ load(); },[load]);
  const items=useMemo(()=>unwrapInbox(payload),[payload]);
  const unread=Number(payload?.unread_count || items.filter(x=>!x.read_at).length || 0);

  async function openMessage(message) {
    setBusy(message.id);
    try {
      const result=await nlRequest(`/api/messages/${encodeURIComponent(message.id)}`);
      setSelected(result?.data || message);
      await load();
    } catch(e) { setError(e?.message || 'Unable to open message.'); }
    finally { setBusy(null); }
  }

  async function markRead(message) {
    setBusy(message.id);
    try {
      await nlRequest(`/api/messages/${encodeURIComponent(message.id)}/read`,{method:'POST'});
      await load();
    } catch(e) { setError(e?.message || 'Unable to mark message as read.'); }
    finally { setBusy(null); }
  }

  async function archive(message) {
    if (!window.confirm('Archive this NurseLink message?')) return;
    setBusy(message.id);
    try {
      await nlRequest(`/api/messages/${encodeURIComponent(message.id)}/archive`,{method:'POST'});
      if (selected?.id === message.id) setSelected(null);
      await load();
    } catch(e) { setError(e?.message || 'Unable to archive message.'); }
    finally { setBusy(null); }
  }

  async function savePrefs(next) {
    setPrefsBusy(true); setPrefsError('');
    try {
      const body={
        in_app_enabled:Boolean(next.in_app_enabled),
        email_enabled:Boolean(next.email_enabled),
        sms_enabled:Boolean(next.sms_enabled),
        push_enabled:Boolean(next.push_enabled),
        whatsapp_enabled:Boolean(next.whatsapp_enabled),
        ...(next.timezone ? {timezone:next.timezone} : {}),
      };
      const result=await nlRequest('/api/notification-preferences',{method:'PATCH',body});
      setPrefs(result);
    } catch(e) { setPrefsError(e?.message || 'Unable to save notification preferences.'); }
    finally { setPrefsBusy(false); }
  }

  const prefData=prefs?.data || null;
  return <section className="nl410-page">
    <header className="nl410-page-head">
      <div><span>COMMUNICATIONS</span><h1>Messages</h1><p>Your real NurseLink inbox, action messages and communication preferences.</p></div>
      <div className="nl410-count"><strong>{unread}</strong><span>Unread</span></div>
    </header>

    <div className="nl410-grid">
      <section className="nl410-panel">
        <div className="nl410-panel-head"><div><span>INBOX</span><h2>Member messages</h2></div><button type="button" className="secondary-button" onClick={load}>Refresh</button></div>
        <CardState loading={loading} error={error} empty={!items.length} emptyTitle="Your inbox is clear" emptyText="New NurseLink messages will appear here.">
          <div className="nl410-list">{items.map(m=><article className={`nl410-message ${!m.read_at?'is-unread':''}`} key={m.id}>
            <button type="button" className="nl410-message-main" onClick={()=>openMessage(m)} disabled={busy===m.id}>
              <div><strong>{m.subject || 'NurseLink message'}</strong><p>{m.body || ''}</p></div>
              <div className="nl410-message-meta"><span>{m.priority || m.category || 'message'}</span><small>{formatDate(m.published_at)}</small></div>
            </button>
            <div className="nl410-row-actions">
              {!m.read_at&&<button type="button" className="secondary-button" onClick={()=>markRead(m)} disabled={busy===m.id}>Mark read</button>}
              {m.action_url&&<a className="secondary-button" href={m.action_url}>Open action</a>}
              <button type="button" className="secondary-button" onClick={()=>archive(m)} disabled={busy===m.id}>Archive</button>
            </div>
          </article>)}</div>
        </CardState>
      </section>

      <aside className="nl410-stack">
        <section className="nl410-panel nl410-detail">
          <div className="nl410-panel-head"><div><span>MESSAGE DETAIL</span><h2>{selected?.subject || 'Select a message'}</h2></div></div>
          {selected ? <>
            <p className="nl410-detail-body">{selected.body || ''}</p>
            <div className="nl410-meta-grid">
              <div><span>Category</span><strong>{selected.category || '—'}</strong></div>
              <div><span>Priority</span><strong>{selected.priority || '—'}</strong></div>
              <div><span>Published</span><strong>{formatDate(selected.published_at) || '—'}</strong></div>
              <div><span>Status</span><strong>{selected.read_at?'Read':'Unread'}</strong></div>
            </div>
            {selected.action_url&&<a className="primary-button" href={selected.action_url}>Open NurseLink action</a>}
          </> : <div className="nl410-state">Choose a message to view its complete content.</div>}
        </section>

        {prefData&&<section className="nl410-panel">
          <div className="nl410-panel-head"><div><span>PREFERENCES</span><h2>Notification channels</h2><p>Mandatory categories remain governed by NurseLink policy.</p></div></div>
          {prefsError&&<div className="nl410-inline-error" role="alert">{prefsError}</div>}
          <div className="nl410-pref-list">
            {[
              ['in_app_enabled','In-app'],
              ['email_enabled','Email'],
              ['sms_enabled','SMS'],
              ['push_enabled','Push'],
              ['whatsapp_enabled','WhatsApp'],
            ].map(([key,label])=><label key={key}><span>{label}</span><input type="checkbox" checked={Boolean(prefData[key])} onChange={e=>setPrefs({...prefs,data:{...prefData,[key]:e.target.checked}})} /></label>)}
          </div>
          <button type="button" className="primary-button" disabled={prefsBusy} onClick={()=>savePrefs(prefData)}>{prefsBusy?'Saving…':'Save preferences'}</button>
        </section>}
      </aside>
    </div>
  </section>;
}

const EMPTY_FORM={record_type:'training',title:'',provider:'',completed_on:'',cpd_units:'',hours:''};

function cleanLearningPayload(form) {
  return {
    record_type:form.record_type,
    title:form.title.trim(),
    provider:form.provider.trim() || null,
    completed_on:form.completed_on || null,
    cpd_units:form.cpd_units === '' ? null : Number(form.cpd_units),
    hours:form.hours === '' ? null : Number(form.hours),
  };
}

export function Phase3LearningPage() {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [form,setForm]=useState(EMPTY_FORM);
  const [editing,setEditing]=useState(null);
  const [busy,setBusy]=useState(false);
  const workspaceRef=useRef(null);

  useLayoutEffect(() => {
    const root=workspaceRef.current;
    if (!root) return undefined;
    const setImportant=(node,property,value) => {
      if (!node || (node.style.getPropertyValue(property) === value && node.style.getPropertyPriority(property) === 'important')) return;
      node.style.setProperty(property,value,'important');
    };
    const apply=() => {
      const compact=window.matchMedia('(max-width: 760px)').matches;
      setImportant(root,'display','block');
      setImportant(root,'width','100%');
      const head=root.querySelector('.nl410-page-head');
      const stats=root.querySelector('.nl410-stats');
      const grid=root.querySelector('.nl410-learning-grid');
      setImportant(head,'display','flex');
      setImportant(head,'width','100%');
      setImportant(stats,'display','grid');
      setImportant(stats,'width','100%');
      setImportant(stats,'grid-template-columns',compact?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))');
      setImportant(grid,'display','grid');
      setImportant(grid,'width','100%');
      setImportant(grid,'grid-template-columns',compact?'1fr':'minmax(300px,380px) minmax(0,1fr)');
    };
    apply();
    const observer=new MutationObserver(apply);
    observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class','style']});
    window.addEventListener('resize',apply);
    return () => { observer.disconnect(); window.removeEventListener('resize',apply); };
  },[]);

  const load=useCallback(async()=>{
    setLoading(true); setError('');
    try {
      const result=await nlRequest('/api/professional-development');
      setRecords(Array.isArray(result?.data)?result.data:[]);
    } catch(e) { setError(e?.message || 'Unable to load professional learning records.'); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{load()},[load]);

  const totals=useMemo(()=>records.reduce((a,r)=>{
    a.hours += Number(r.hours || 0); a.cpd += Number(r.cpd_units || 0);
    if(r.status==='verified') a.verified += 1;
    return a;
  },{hours:0,cpd:0,verified:0}),[records]);

  function startEdit(r){
    setEditing(r.id);
    setForm({
      record_type:r.record_type || 'training',
      title:r.title || '',
      provider:r.provider || '',
      completed_on:r.completed_on ? String(r.completed_on).slice(0,10) : '',
      cpd_units:r.cpd_units ?? '',
      hours:r.hours ?? '',
    });
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function resetForm(){ setEditing(null); setForm(EMPTY_FORM); setNotice(''); }

  async function submit(e){
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const path=editing?`/api/professional-development/${encodeURIComponent(editing)}`:'/api/professional-development';
      await nlRequest(path,{method:editing?'PATCH':'POST',body:cleanLearningPayload(form)});
      setNotice(editing?'Learning record updated. Verification status was reset to self-declared for review.':'Learning record added as self-declared.');
      setEditing(null); setForm(EMPTY_FORM); await load();
    } catch(e2) { setError(e2?.message || 'Unable to save learning record.'); }
    finally { setBusy(false); }
  }

  async function remove(r){
    if(!window.confirm(`Delete "${r.title}" from your professional learning record?`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await nlRequest(`/api/professional-development/${encodeURIComponent(r.id)}`,{method:'DELETE'});
      setNotice('Learning record deleted.'); await load();
    } catch(e){ setError(e?.message || 'Unable to delete learning record.'); }
    finally { setBusy(false); }
  }

  return <section className="nl410-page">
    <div className="nl410-learning-flow" ref={workspaceRef}>
    <header className="nl410-page-head">
      <div><span>PROFESSIONAL LEARNING</span><h1>Learning</h1><p>Maintain your actual NurseLink professional development record.</p></div>
    </header>

    <div className="nl410-stats">
      <div><span>Total records</span><strong>{records.length}</strong></div>
      <div><span>Verified</span><strong>{totals.verified}</strong></div>
      <div><span>Learning hours</span><strong>{totals.hours.toFixed(1)}</strong></div>
      <div><span>CPD units</span><strong>{totals.cpd.toFixed(1)}</strong></div>
    </div>

    {(error||notice)&&<div className={`nl410-notice ${error?'is-error':'is-success'}`} role={error?'alert':'status'}>{error||notice}</div>}

    <div className="nl410-grid nl410-learning-grid">
      <form className="nl410-panel nl410-form" onSubmit={submit}>
        <div className="nl410-panel-head"><div><span>{editing?'EDIT RECORD':'ADD RECORD'}</span><h2>{editing?'Update professional learning':'Add professional learning'}</h2><p>Self-declared records may later be independently verified.</p></div></div>

        <label><span>Activity type *</span><select value={form.record_type} onChange={e=>setForm({...form,record_type:e.target.value})} required>
          <option value="training">Training</option><option value="seminar">Seminar</option><option value="cpd">CPD</option><option value="workshop">Workshop</option><option value="conference">Conference</option>
        </select></label>
        <label><span>Title *</span><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} maxLength="180" required /></label>
        <label><span>Provider</span><input value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})} maxLength="180" /></label>
        <div className="nl410-form-two">
          <label><span>Completed on</span><input type="date" value={form.completed_on} onChange={e=>setForm({...form,completed_on:e.target.value})} /></label>
          <label><span>Hours</span><input type="number" min="0" max="9999.99" step="0.01" value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} /></label>
        </div>
        <label><span>CPD units</span><input type="number" min="0" max="9999.99" step="0.01" value={form.cpd_units} onChange={e=>setForm({...form,cpd_units:e.target.value})} /></label>

        <div className="nl410-row-actions">
          <button className="primary-button" type="submit" disabled={busy}>{busy?'Saving…':editing?'Update record':'Add learning record'}</button>
          {editing&&<button className="secondary-button" type="button" onClick={resetForm} disabled={busy}>Cancel</button>}
        </div>
      </form>

      <section className="nl410-panel">
        <div className="nl410-panel-head"><div><span>LEARNING RECORD</span><h2>Your professional development</h2></div><button type="button" className="secondary-button" onClick={load}>Refresh</button></div>
        <CardState loading={loading} error="" empty={!records.length} emptyTitle="Start your professional learning record" emptyText="Add a course, webinar, workshop, conference or other supported learning activity.">
          <div className="nl410-list">{records.map(r=><article className="nl410-learning-card" key={r.id}>
            <div className="nl410-learning-head"><div><span>{r.record_type || 'learning'}</span><h3>{r.title}</h3><p>{r.provider || 'Provider not recorded'}</p></div><span className={`nl410-status ${r.status==='verified'?'is-verified':''}`}>{r.status || 'self_declared'}</span></div>
            <div className="nl410-meta-grid">
              <div><span>Completed</span><strong>{r.completed_on ? String(r.completed_on).slice(0,10) : '—'}</strong></div>
              <div><span>Hours</span><strong>{Number(r.hours||0).toFixed(1)}</strong></div>
              <div><span>CPD units</span><strong>{Number(r.cpd_units||0).toFixed(1)}</strong></div>
              <div><span>Evidence</span><strong>{r.evidence_document_id?'Linked':'None'}</strong></div>
            </div>
            {r.verification_note&&<p className="nl410-verification-note">{r.verification_note}</p>}
            <div className="nl410-row-actions">
              <button type="button" className="secondary-button" onClick={()=>startEdit(r)} disabled={busy}>Edit</button>
              <button type="button" className="secondary-button danger" onClick={()=>remove(r)} disabled={busy}>Delete</button>
            </div>
          </article>)}</div>
        </CardState>
      </section>
    </div>
    </div>
  </section>;
}
