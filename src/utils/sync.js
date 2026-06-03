// GitHub Gist sync utility
// Stores radar data as a secret gist, accessible from any device

const GIST_FILENAME = 'radar-data.json'
const SYNC_TOKEN_KEY = 'radar-sync-token'
const SYNC_GIST_KEY = 'radar-sync-gist-id'

function getToken() {
  return localStorage.getItem(SYNC_TOKEN_KEY)
}

function getGistId() {
  return localStorage.getItem(SYNC_GIST_KEY)
}

export function setSyncConfig(token, gistId) {
  if (token) localStorage.setItem(SYNC_TOKEN_KEY, token)
  if (gistId) localStorage.setItem(SYNC_GIST_KEY, gistId)
}

export function clearSyncConfig() {
  localStorage.removeItem(SYNC_TOKEN_KEY)
  localStorage.removeItem(SYNC_GIST_KEY)
}

export function isConfigured() {
  return !!(getToken() && getGistId())
}

export function hasToken() {
  return !!getToken()
}

// Create a new gist with current data
export async function createGist(data) {
  const token = getToken()
  if (!token) throw new Error('No sync token configured')

  const resp = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Radar App Data - 梳理合并突破工作台',
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error: ${resp.status}`)
  }

  const gist = await resp.json()
  setSyncConfig(null, gist.id)
  return gist.id
}

// Save data to existing gist
export async function saveToGist(data) {
  const token = getToken()
  const gistId = getGistId()
  if (!token || !gistId) throw new Error('Sync not configured')

  const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error: ${resp.status}`)
  }

  return true
}

// Load data from gist
export async function loadFromGist() {
  const token = getToken()
  const gistId = getGistId()
  if (!token || !gistId) throw new Error('Sync not configured')

  const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `token ${token}`,
    },
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error: ${resp.status}`)
  }

  const gist = await resp.json()
  const file = gist.files[GIST_FILENAME]
  if (!file) throw new Error('Gist file not found')

  return JSON.parse(file.content)
}

// Validate token by checking user info
export async function validateToken(token) {
  const resp = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
    },
  })
  if (!resp.ok) return null
  const user = await resp.json()
  return { login: user.login, avatar: user.avatar_url }
}
