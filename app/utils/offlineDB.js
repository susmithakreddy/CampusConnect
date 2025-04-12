'use client';

import { openDB } from 'idb';

export async function getDB() {
  return await openDB('campusconnect-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('materials')) {
        db.createObjectStore('materials', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assignments')) {
        db.createObjectStore('assignments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('announcements')) {
        db.createObjectStore('announcements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-submissions')) {
        db.createObjectStore('pending-submissions', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}
