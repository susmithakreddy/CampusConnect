'use client';

import Cookies from 'js-cookie';

let refreshIntervalId = null;

// Save tokens
export const setTokens = (access, refresh) => {
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
  Cookies.set('accessToken', access);
  Cookies.set('refreshToken', refresh);
};

// Get access token
export const getAccessToken = async () => {
  let access = localStorage.getItem('access');

  if (!access) {
    return null;
  }

  // Optionally, you could check if token is expired here
  return access;
};

// Start token auto-refresh (every 4 minutes)
export function startTokenRefresh() {
  if (refreshIntervalId) return; // already started

  refreshIntervalId = setInterval(async () => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access', data.access);
        Cookies.set('accessToken', data.access);
      } else {
        clearTokens();
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      clearTokens();
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }
  }, 1000 * 60 * 4); // every 4 minutes
}

// Stop token auto-refresh
export function stopTokenRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

// Clear tokens from storage (on logout)
export const clearTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  localStorage.removeItem('email');
};
