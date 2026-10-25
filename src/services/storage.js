// src/services/storage.js
// Safe localStorage wrapper for SocietySync with schema versioning and reset capability

import {
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_RESIDENTS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

const STORAGE_PREFIX = 'societysync_v2_';

export const STORAGE_KEYS = {
  COMPLAINTS: `${STORAGE_PREFIX}complaints`,
  ANNOUNCEMENTS: `${STORAGE_PREFIX}announcements`,
  EVENTS: `${STORAGE_PREFIX}events`,
  RESIDENTS: `${STORAGE_PREFIX}residents`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`
};

/**
 * Safe getItem with fallback
 */
export function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallbackValue;
  } catch (err) {
    console.warn(`[SocietySync Storage] Failed reading key "${key}". Using fallback.`, err);
    return fallbackValue;
  }
}

/**
 * Safe setItem
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[SocietySync Storage] Failed saving key "${key}".`, err);
  }
}

/**
 * Initialize all datasets if not already present
 */
export function initializeStorage() {
  const complaints = loadFromStorage(STORAGE_KEYS.COMPLAINTS, null);
  if (!complaints || !Array.isArray(complaints) || complaints.length === 0) {
    saveToStorage(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  const announcements = loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, null);
  if (!announcements || !Array.isArray(announcements)) {
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  const events = loadFromStorage(STORAGE_KEYS.EVENTS, null);
  if (!events || !Array.isArray(events)) {
    saveToStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  const residents = loadFromStorage(STORAGE_KEYS.RESIDENTS, null);
  if (!residents || !Array.isArray(residents)) {
    saveToStorage(STORAGE_KEYS.RESIDENTS, INITIAL_RESIDENTS);
  }

  const notifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, null);
  if (!notifications || !Array.isArray(notifications)) {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
}

/**
 * Complete Reset to pristine Demo Dataset
 */
export function resetDemoData() {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(INITIAL_RESIDENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return {
      complaints: INITIAL_COMPLAINTS,
      announcements: INITIAL_ANNOUNCEMENTS,
      events: INITIAL_EVENTS,
      residents: INITIAL_RESIDENTS,
      notifications: INITIAL_NOTIFICATIONS
    };
  } catch (err) {
    console.error('[SocietySync Storage] Error resetting demo data:', err);
    throw err;
  }
}
