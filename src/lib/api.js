const API_URL =
  import.meta.env.VITE_API_URL || 'https://api.amsertech.com'

function getCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))

  if (!cookie) return null

  return decodeURIComponent(
    cookie.substring(name.length + 1)
  )
}

async function parseResponse(response) {
  const contentType =
    response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

async function request(path, options = {}) {
  const method =
    (options.method || 'GET').toUpperCase()

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] =
      'application/json'
  }

  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(method)
  ) {
    const token =
      getCookie('XSRF-TOKEN')

    if (token) {
      headers['X-XSRF-TOKEN'] = token
    }
  }

  let response

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        method,
        headers,
        credentials: 'include',
      }
    )
  } catch (error) {
    const networkError =
      new Error(
        'Unable to connect to the NurseLink API.'
      )

    networkError.original = error
    networkError.code = 'network_error'

    throw networkError
  }

  const data =
    await parseResponse(response)

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}.`
      )

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}

/*
|--------------------------------------------------------------------------
| CSRF
|--------------------------------------------------------------------------
*/

export async function csrf() {
  let response

  try {
    response = await fetch(
      `${API_URL}/sanctum/csrf-cookie`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }
    )
  } catch (error) {
    const networkError =
      new Error(
        'Unable to initialize the secure NurseLink session.'
      )

    networkError.original = error
    networkError.code = 'csrf_network_error'

    throw networkError
  }

  if (!response.ok) {
    throw new Error(
      `Unable to initialize secure session. Status ${response.status}.`
    )
  }

  return true
}

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export async function login(
  email,
  password
) {
  await csrf()

  await request('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })

  return getMe()
}

export async function register({
  name,
  email,
  password,
  password_confirmation,
}) {
  await csrf()

  return request('/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation:
        password_confirmation || password,
    }),
  })
}

export async function resetPassword({
  token,
  email,
  password,
  password_confirmation,
}) {
  await csrf()

  return request('/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token,
      email,
      password,
      password_confirmation,
    }),
  })
}

export async function requestPasswordReset(email) {
  await csrf()

  return request('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resendEmailVerification() {
  return request(
    '/api/send-email-link',
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  )
}

export async function logout() {
  await csrf()

  return request('/logout', {
    method: 'POST',
  })
}

export async function getMe() {
  const response =
    await request('/api/me')

  return response.data
}

/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/

export async function getApplication() {
  const response =
    await request(
      '/api/applications/me'
    )

  return response.data
}

export async function getMember() {
  const response = await request('/api/members/me')
  return response.data
}

export async function updateMemberProfile(values) {
  const response = await request('/api/members/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
  return response.data
}

export async function createApplication() {
  const response =
    await request(
      '/api/applications',
      {
        method: 'POST',
      }
    )

  return response.data
}

export async function updateApplicationProfile(
  applicationId,
  values
) {
  const response =
    await request(
      `/api/applications/${applicationId}/profile`,
      {
        method: 'PATCH',
        body: JSON.stringify(values),
      }
    )

  return response.data
}

export async function markApplicationReady(
  applicationId
) {
  const response =
    await request(
      `/api/applications/${applicationId}/ready`,
      {
        method: 'POST',
      }
    )

  return response.data
}

export async function submitApplication(
  applicationId
) {
  const response =
    await request(
      `/api/applications/${applicationId}/submit`,
      {
        method: 'POST',
      }
    )

  return response.data
}

export async function resubmitApplication(
  applicationId
) {
  const response =
    await request(
      `/api/applications/${applicationId}/resubmit`,
      {
        method: 'POST',
      }
    )

  return response.data
}

/*
|--------------------------------------------------------------------------
| Smart Registration
|--------------------------------------------------------------------------
*/

export async function getSmartRegistration() {
  return request(
    '/api/smart-registration'
  )
}

export async function uploadApplicationDocument(file) {
  await csrf()

  const formData =
    new FormData()

  formData.append(
    'document',
    file
  )

  return request(
    '/api/smart-registration/documents',
    {
      method: 'POST',
      body: formData,
    }
  )
}

export async function refreshMissingFields(
  applicationId
) {
  return request(
    `/api/applications/${applicationId}/missing-fields/refresh`,
    {
      method: 'POST',
    }
  )
}

/*
|--------------------------------------------------------------------------
| Credentials
|--------------------------------------------------------------------------
*/

export async function getCredentials() {
  return request(
    '/api/credentials'
  )
}

export async function getCredentialDashboard() {
  return request(
    '/api/credentials/dashboard'
  )
}

export async function createCredential(
  values
) {
  return request(
    '/api/credentials',
    {
      method: 'POST',
      body: JSON.stringify(values),
    }
  )
}

export async function updateCredential(
  credentialId,
  values
) {
  return request(
    `/api/credentials/${credentialId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(values),
    }
  )
}

export async function deleteCredential(
  credentialId
) {
  return request(
    `/api/credentials/${credentialId}`,
    {
      method: 'DELETE',
    }
  )
}

/*
|--------------------------------------------------------------------------
| Member Documents
|--------------------------------------------------------------------------
*/

export async function getDocuments() {
  return request(
    '/api/documents'
  )
}

export async function uploadMemberDocument(
  values
) {
  await csrf()

  const formData =
    new FormData()

  formData.append(
    'file',
    values.file
  )

  formData.append(
    'document_type',
    values.document_type
  )

  if (values.title) {
    formData.append(
      'title',
      values.title
    )
  }

  if (values.issued_on) {
    formData.append(
      'issued_on',
      values.issued_on
    )
  }

  if (values.expires_on) {
    formData.append(
      'expires_on',
      values.expires_on
    )
  }

  return request(
    '/api/documents',
    {
      method: 'POST',
      body: formData,
    }
  )
}

export async function deleteDocument(
  documentId
) {
  return request(
    `/api/documents/${documentId}`,
    {
      method: 'DELETE',
    }
  )
}

/*
|--------------------------------------------------------------------------
| Professional Development
|--------------------------------------------------------------------------
*/

export async function getProfessionalDevelopment() {
  return request(
    '/api/professional-development'
  )
}

export async function createProfessionalDevelopment(
  values
) {
  return request(
    '/api/professional-development',
    {
      method: 'POST',
      body: JSON.stringify(values),
    }
  )
}

export async function updateProfessionalDevelopment(
  recordId,
  values
) {
  return request(
    `/api/professional-development/${recordId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(values),
    }
  )
}

export async function deleteProfessionalDevelopment(
  recordId
) {
  return request(
    `/api/professional-development/${recordId}`,
    {
      method: 'DELETE',
    }
  )
}

export {
  API_URL,
  request,
}
