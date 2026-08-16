import {
  useEffect,
  useState,
} from 'react'

import {
  createCredential,
  createProfessionalDevelopment,
  deleteCredential,
  deleteDocument,
  deleteProfessionalDevelopment,
  getCredentialDashboard,
  getCredentials,
  getDocuments,
  getProfessionalDevelopment,
  uploadMemberDocument,
} from '../lib/api'

const credentialDefaults = {
  category: 'license',
  credential_type: 'PRC Nursing License',
  title: 'Registered Nurse License',
  credential_number: '',
  issuing_authority:
    'Professional Regulation Commission',
  country: 'PH',
  issued_on: '',
  expires_on: '',
  does_not_expire: false,
}

const documentDefaults = {
  document_type: 'prc_license',
  title: '',
  issued_on: '',
  expires_on: '',
  file: null,
}

const developmentDefaults = {
  record_type: 'cpd',
  title: '',
  provider: '',
  country: 'PH',
  completed_on: '',
  cpd_units: '',
  hours: '',
}

function getErrorMessage(error) {
  if (error?.data?.errors) {
    const first =
      Object.values(
        error.data.errors
      )[0]

    if (Array.isArray(first)) {
      return first[0]
    }

    return first
  }

  return (
    error?.data?.message ||
    error?.message ||
    'The request could not be completed.'
  )
}

function normalizeCollection(response) {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data
  }

  return []
}

export default function Credentials() {
  const [
    credentials,
    setCredentials,
  ] = useState([])

  const [
    documents,
    setDocuments,
  ] = useState([])

  const [
    development,
    setDevelopment,
  ] = useState([])

  const [
    dashboard,
    setDashboard,
  ] = useState(null)

  const [
    credentialForm,
    setCredentialForm,
  ] = useState({
    ...credentialDefaults,
  })

  const [
    documentForm,
    setDocumentForm,
  ] = useState({
    ...documentDefaults,
  })

  const [
    developmentForm,
    setDevelopmentForm,
  ] = useState({
    ...developmentDefaults,
  })

  const [loading, setLoading] =
    useState(true)

  const [
    savingCredential,
    setSavingCredential,
  ] = useState(false)

  const [
    savingDocument,
    setSavingDocument,
  ] = useState(false)

  const [
    savingDevelopment,
    setSavingDevelopment,
  ] = useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  async function loadData() {
    try {
      setError('')

      const [
        credentialResponse,
        documentResponse,
        developmentResponse,
        dashboardResponse,
      ] = await Promise.all([
        getCredentials(),
        getDocuments(),
        getProfessionalDevelopment(),
        getCredentialDashboard(),
      ])

      setCredentials(
        normalizeCollection(
          credentialResponse
        )
      )

      setDocuments(
        normalizeCollection(
          documentResponse
        )
      )

      setDevelopment(
        normalizeCollection(
          developmentResponse
        )
      )

      setDashboard(
        dashboardResponse?.data ||
          dashboardResponse ||
          null
      )
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function updateCredentialField(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setCredentialForm(
      (current) => ({
        ...current,

        [name]:
          type === 'checkbox'
            ? checked
            : value,
      })
    )
  }

  function updateDocumentField(event) {
    const {
      name,
      value,
      files,
    } = event.target

    setDocumentForm(
      (current) => ({
        ...current,

        [name]:
          name === 'file'
            ? files?.[0] || null
            : value,
      })
    )
  }

  function updateDevelopmentField(
    event
  ) {
    const {
      name,
      value,
    } = event.target

    setDevelopmentForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    )
  }

  async function handleCredentialSubmit(
    event
  ) {
    event.preventDefault()

    setSavingCredential(true)
    setMessage('')
    setError('')

    try {
      await createCredential({
        category:
          credentialForm.category,

        credential_type:
          credentialForm
            .credential_type,

        title:
          credentialForm.title,

        credential_number:
          credentialForm
            .credential_number ||
          null,

        issuing_authority:
          credentialForm
            .issuing_authority ||
          null,

        country:
          credentialForm.country ||
          null,

        issued_on:
          credentialForm.issued_on ||
          null,

        expires_on:
          credentialForm
            .does_not_expire
            ? null
            : credentialForm
                .expires_on ||
              null,

        does_not_expire:
          credentialForm
            .does_not_expire,
      })

      setCredentialForm({
        ...credentialDefaults,
      })

      setMessage(
        'Professional credential added successfully.'
      )

      await loadData()
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setSavingCredential(false)
    }
  }

  async function handleDocumentSubmit(
    event
  ) {
    event.preventDefault()

    if (!documentForm.file) {
      setError(
        'Please select a document.'
      )

      return
    }

    setSavingDocument(true)
    setMessage('')
    setError('')

    try {
      await uploadMemberDocument({
        file:
          documentForm.file,

        document_type:
          documentForm
            .document_type,

        title:
          documentForm.title,

        issued_on:
          documentForm.issued_on,

        expires_on:
          documentForm.expires_on,
      })

      setDocumentForm({
        ...documentDefaults,
      })

      event.target.reset()

      setMessage(
        'Supporting document uploaded successfully.'
      )

      await loadData()
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setSavingDocument(false)
    }
  }

  async function handleDevelopmentSubmit(
    event
  ) {
    event.preventDefault()

    setSavingDevelopment(true)
    setMessage('')
    setError('')

    try {
      await createProfessionalDevelopment(
        {
          record_type:
            developmentForm
              .record_type,

          title:
            developmentForm.title,

          provider:
            developmentForm
              .provider ||
            null,

          country:
            developmentForm
              .country ||
            null,

          completed_on:
            developmentForm
              .completed_on ||
            null,

          cpd_units:
            developmentForm
                .cpd_units === ''
              ? null
              : Number(
                  developmentForm
                    .cpd_units
                ),

          hours:
            developmentForm
                .hours === ''
              ? null
              : Number(
                  developmentForm
                    .hours
                ),
        }
      )

      setDevelopmentForm({
        ...developmentDefaults,
      })

      setMessage(
        'Professional development record added successfully.'
      )

      await loadData()
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setSavingDevelopment(false)
    }
  }

  async function handleDeleteCredential(
    id
  ) {
    if (
      !window.confirm(
        'Are you sure you want to delete this credential?'
      )
    ) {
      return
    }

    try {
      await deleteCredential(id)
      await loadData()
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    }
  }

  async function handleDeleteDocument(
    id
  ) {
    if (
      !window.confirm(
        'Are you sure you want to delete this document?'
      )
    ) {
      return
    }

    try {
      await deleteDocument(id)
      await loadData()
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    }
  }

  async function handleDeleteDevelopment(
    id
  ) {
    if (
      !window.confirm(
        'Are you sure you want to delete this professional development record?'
      )
    ) {
      return
    }

    try {
      await deleteProfessionalDevelopment(
        id
      )

      await loadData()
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    }
  }

  if (loading) {
    return (
      <div className="page">
        Loading credentials...
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Professional Credentials
          </div>

          <h1>
            Credentials &
            Professional Development
          </h1>

          <p>
            Manage licenses,
            certifications, supporting
            documents, training,
            seminars and CPD records.
          </p>
        </div>
      </div>

      {message && (
        <div className="form-success">
          {message}
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Credentials</span>

          <strong>
            {credentials.length}
          </strong>

          <small>
            Licenses and
            certifications
          </small>
        </div>

        <div className="stat-card">
          <span>Documents</span>

          <strong>
            {documents.length}
          </strong>

          <small>
            Supporting evidence
          </small>
        </div>

        <div className="stat-card">
          <span>
            Professional Development
          </span>

          <strong>
            {development.length}
          </strong>

          <small>
            CPD and training
          </small>
        </div>

        <div className="stat-card">
          <span>
            Credential Status
          </span>

          <strong className="status-word">
            {dashboard?.status ||
              'In Progress'}
          </strong>

          <small>
            Verification monitoring
          </small>
        </div>
      </div>

      <div className="credentials-layout">
        <form
          className="panel credentials-form"
          onSubmit={
            handleCredentialSubmit
          }
        >
          <h2>
            Add Professional Credential
          </h2>

          <div className="profile-grid two">
            <label>
              Category

              <select
                name="category"
                value={
                  credentialForm
                    .category
                }
                onChange={
                  updateCredentialField
                }
              >
                <option value="license">
                  License
                </option>

                <option value="registration">
                  Registration
                </option>

                <option value="certification">
                  Certification
                </option>

                <option value="training">
                  Training
                </option>

                <option value="cpd">
                  CPD
                </option>
              </select>
            </label>

            <label>
              Credential Type *

              <input
                name="credential_type"
                value={
                  credentialForm
                    .credential_type
                }
                onChange={
                  updateCredentialField
                }
                required
              />
            </label>

            <label>
              Title *

              <input
                name="title"
                value={
                  credentialForm.title
                }
                onChange={
                  updateCredentialField
                }
                required
              />
            </label>

            <label>
              Credential Number

              <input
                name="credential_number"
                value={
                  credentialForm
                    .credential_number
                }
                onChange={
                  updateCredentialField
                }
              />
            </label>

            <label>
              Issuing Authority

              <input
                name="issuing_authority"
                value={
                  credentialForm
                    .issuing_authority
                }
                onChange={
                  updateCredentialField
                }
              />
            </label>

            <label>
              Country Code

              <input
                name="country"
                maxLength="2"
                value={
                  credentialForm
                    .country
                }
                onChange={
                  updateCredentialField
                }
              />
            </label>

            <label>
              Date Issued

              <input
                type="date"
                name="issued_on"
                value={
                  credentialForm
                    .issued_on
                }
                onChange={
                  updateCredentialField
                }
              />
            </label>

            <label>
              Expiry Date

              <input
                type="date"
                name="expires_on"
                value={
                  credentialForm
                    .expires_on
                }
                disabled={
                  credentialForm
                    .does_not_expire
                }
                onChange={
                  updateCredentialField
                }
              />
            </label>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="does_not_expire"
              checked={
                credentialForm
                  .does_not_expire
              }
              onChange={
                updateCredentialField
              }
            />

            <span>
              This credential does
              not expire
            </span>
          </label>

          <button
            className="primary-button"
            disabled={
              savingCredential
            }
          >
            {savingCredential
              ? 'Saving...'
              : 'Add Credential'}
          </button>
        </form>

        <div className="panel">
          <div className="panel-title">
            <h2>
              My Credentials
            </h2>

            <span className="muted">
              {credentials.length}{' '}
              record(s)
            </span>
          </div>

          {credentials.length === 0 ? (
            <p>
              No professional
              credentials added yet.
            </p>
          ) : (
            <div className="credential-list">
              {credentials.map(
                (credential) => (
                  <div
                    className="credential-card"
                    key={credential.id}
                  >
                    <div>
                      <strong>
                        {
                          credential
                            .title
                        }
                      </strong>

                      <small>
                        {
                          credential
                            .credential_type
                        }
                      </small>

                      {credential
                        .credential_number && (
                        <span>
                          No.{' '}
                          {
                            credential
                              .credential_number
                          }
                        </span>
                      )}

                      {credential
                        .issuing_authority && (
                        <span>
                          {
                            credential
                              .issuing_authority
                          }
                        </span>
                      )}
                    </div>

                    <div className="credential-actions">
                      <span className="document-status">
                        {
                          credential
                            .verification_status ||
                          credential.status ||
                          'Pending'
                        }
                      </span>

                      <button
                        type="button"
                        className="danger-link"
                        onClick={() =>
                          handleDeleteCredential(
                            credential.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="credentials-layout">
        <form
          className="panel credentials-form"
          onSubmit={
            handleDocumentSubmit
          }
        >
          <h2>
            Upload Supporting Document
          </h2>

          <label>
            Document Type *

            <input
              name="document_type"
              value={
                documentForm
                  .document_type
              }
              onChange={
                updateDocumentField
              }
              required
            />
          </label>

          <label>
            Document Title

            <input
              name="title"
              value={
                documentForm.title
              }
              onChange={
                updateDocumentField
              }
            />
          </label>

          <div className="profile-grid two">
            <label>
              Date Issued

              <input
                type="date"
                name="issued_on"
                value={
                  documentForm
                    .issued_on
                }
                onChange={
                  updateDocumentField
                }
              />
            </label>

            <label>
              Expiry Date

              <input
                type="date"
                name="expires_on"
                value={
                  documentForm
                    .expires_on
                }
                onChange={
                  updateDocumentField
                }
              />
            </label>
          </div>

          <label>
            File *

            <input
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={
                updateDocumentField
              }
              required
            />
          </label>

          <button
            className="primary-button"
            disabled={
              savingDocument
            }
          >
            {savingDocument
              ? 'Uploading...'
              : 'Upload Document'}
          </button>
        </form>

        <div className="panel">
          <div className="panel-title">
            <h2>
              Credential Documents
            </h2>

            <span className="muted">
              {documents.length}{' '}
              file(s)
            </span>
          </div>

          {documents.length === 0 ? (
            <p>
              No credential documents
              uploaded yet.
            </p>
          ) : (
            <div className="document-list">
              {documents.map(
                (document) => (
                  <div
                    className="document-row"
                    key={document.id}
                  >
                    <div>
                      <strong>
                        {document.title ||
                          document
                            .original_name ||
                          'Document'}
                      </strong>

                      <small>
                        {
                          document
                            .document_type
                        }
                      </small>
                    </div>

                    <div className="credential-actions">
                      <span className="document-status">
                        {
                          document
                            .security_status ||
                          document
                            .malware_scan_status ||
                          'Pending'
                        }
                      </span>

                      <button
                        type="button"
                        className="danger-link"
                        onClick={() =>
                          handleDeleteDocument(
                            document.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="credentials-layout">
        <form
          className="panel credentials-form"
          onSubmit={
            handleDevelopmentSubmit
          }
        >
          <h2>
            Add Professional Development
          </h2>

          <label>
            Record Type

            <select
              name="record_type"
              value={
                developmentForm
                  .record_type
              }
              onChange={
                updateDevelopmentField
              }
            >
              <option value="training">
                Training
              </option>

              <option value="seminar">
                Seminar
              </option>

              <option value="cpd">
                CPD
              </option>

              <option value="workshop">
                Workshop
              </option>

              <option value="conference">
                Conference
              </option>
            </select>
          </label>

          <label>
            Title *

            <input
              name="title"
              value={
                developmentForm.title
              }
              onChange={
                updateDevelopmentField
              }
              required
            />
          </label>

          <label>
            Provider

            <input
              name="provider"
              value={
                developmentForm
                  .provider
              }
              onChange={
                updateDevelopmentField
              }
            />
          </label>

          <div className="profile-grid two">
            <label>
              Country Code

              <input
                name="country"
                maxLength="2"
                value={
                  developmentForm
                    .country
                }
                onChange={
                  updateDevelopmentField
                }
              />
            </label>

            <label>
              Completed On

              <input
                type="date"
                name="completed_on"
                value={
                  developmentForm
                    .completed_on
                }
                onChange={
                  updateDevelopmentField
                }
              />
            </label>

            <label>
              CPD Units

              <input
                type="number"
                min="0"
                step="0.01"
                name="cpd_units"
                value={
                  developmentForm
                    .cpd_units
                }
                onChange={
                  updateDevelopmentField
                }
              />
            </label>

            <label>
              Hours

              <input
                type="number"
                min="0"
                step="0.01"
                name="hours"
                value={
                  developmentForm
                    .hours
                }
                onChange={
                  updateDevelopmentField
                }
              />
            </label>
          </div>

          <button
            className="primary-button"
            disabled={
              savingDevelopment
            }
          >
            {savingDevelopment
              ? 'Saving...'
              : 'Add Development Record'}
          </button>
        </form>

        <div className="panel">
          <div className="panel-title">
            <h2>
              Professional Development History
            </h2>

            <span className="muted">
              {development.length}{' '}
              record(s)
            </span>
          </div>

          {development.length === 0 ? (
            <p>
              No professional
              development records yet.
            </p>
          ) : (
            <div className="credential-list">
              {development.map(
                (record) => (
                  <div
                    className="credential-card"
                    key={record.id}
                  >
                    <div>
                      <strong>
                        {record.title}
                      </strong>

                      <small>
                        {
                          record
                            .record_type
                        }
                      </small>

                      {record.provider && (
                        <span>
                          {record.provider}
                        </span>
                      )}

                      {record.cpd_units !=
                        null && (
                        <span>
                          {
                            record
                              .cpd_units
                          }{' '}
                          CPD units
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="danger-link"
                      onClick={() =>
                        handleDeleteDevelopment(
                          record.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}