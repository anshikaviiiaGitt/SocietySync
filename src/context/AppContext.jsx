// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  resetDemoData as resetLocalData
} from '../services/storage';
import { useToast } from './ToastContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const toast = useToast();

  const [complaints, setComplaints] = useState(() => loadFromStorage(STORAGE_KEYS.COMPLAINTS, []));
  const [announcements, setAnnouncements] = useState(() => loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, []));
  const [events, setEvents] = useState(() => loadFromStorage(STORAGE_KEYS.EVENTS, []));
  const [residents, setResidents] = useState(() => loadFromStorage(STORAGE_KEYS.RESIDENTS, []));
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));

  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    database: 'Checking...',
    aiConfigured: false,
    activeMode: 'Detecting...'
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch all initial data from backend SQLite API
  const refreshAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Health & status
      const health = await apiClient.getHealth().catch(() => null);
      if (health) {
        setBackendStatus({
          connected: true,
          database: health.database || 'SQLite Connected',
          aiConfigured: health.aiConfigured,
          activeMode: health.activeMode
        });
      } else {
        setBackendStatus({
          connected: false,
          database: 'Offline (Local Fallback)',
          aiConfigured: false,
          activeMode: 'Local Heuristic Engine'
        });
      }

      // 2. Fetch parallel endpoints
      const [cRes, eRes, aRes, rRes, nRes] = await Promise.all([
        apiClient.getComplaints().catch(() => null),
        apiClient.getEvents().catch(() => null),
        apiClient.getAnnouncements().catch(() => null),
        apiClient.getResidents().catch(() => null),
        apiClient.getNotifications().catch(() => null)
      ]);

      if (cRes && cRes.data) {
        setComplaints(cRes.data);
        saveToStorage(STORAGE_KEYS.COMPLAINTS, cRes.data);
      }
      if (eRes && eRes.data) {
        setEvents(eRes.data);
        saveToStorage(STORAGE_KEYS.EVENTS, eRes.data);
      }
      if (aRes && aRes.data) {
        setAnnouncements(aRes.data);
        saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, aRes.data);
      }
      if (rRes && rRes.data) {
        setResidents(rRes.data);
        saveToStorage(STORAGE_KEYS.RESIDENTS, rRes.data);
      }
      if (nRes && nRes.data) {
        setNotifications(nRes.data);
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, nRes.data);
      }
    } catch (err) {
      console.warn('[SocietySync] Backend fetch failed. Falling back to local storage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // ----------------------------------------------------
  // COMPLAINT ACTIONS
  // ----------------------------------------------------
  const addComplaint = useCallback(async (complaintData) => {
    try {
      const res = await apiClient.createComplaint(complaintData);
      toast.success(res.message || 'Complaint submitted successfully!');
      await refreshAllData();
      return res;
    } catch (err) {
      // Local fallback if server unreachable
      const timestamp = new Date().toISOString();
      const count = complaints.length + 101;
      const newId = `CMP-2024-${count}`;
      const newComplaint = {
        ...complaintData,
        id: newId,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: complaintData.status || 'Pending',
        resolutionNotes: complaintData.resolutionNotes || '',
        history: [
          {
            id: Date.now(),
            timestamp,
            actor: `${complaintData.residentName} (${complaintData.flatNumber})`,
            action: 'Complaint Registered',
            note: `Logged as ${complaintData.priority} priority in ${complaintData.category}.`
          }
        ]
      };
      setComplaints(prev => [newComplaint, ...prev]);
      saveToStorage(STORAGE_KEYS.COMPLAINTS, [newComplaint, ...complaints]);
      toast.success(`Complaint #${newId} saved locally.`);
      return newComplaint;
    }
  }, [complaints, refreshAllData, toast]);

  const updateComplaint = useCallback(async (id, updatedFields) => {
    try {
      const res = await apiClient.updateComplaint(id, updatedFields);
      toast.success(res.message || `Complaint #${id} updated.`);
      await refreshAllData();
    } catch (err) {
      // Fallback
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, ...updatedFields, updatedAt: new Date().toISOString() } : c)));
      toast.info(`Complaint #${id} updated locally.`);
    }
  }, [refreshAllData, toast]);

  const deleteComplaint = useCallback(async (id) => {
    try {
      const res = await apiClient.deleteComplaint(id);
      toast.info(res.message || `Complaint #${id} deleted.`);
      await refreshAllData();
    } catch (err) {
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.info(`Complaint #${id} deleted locally.`);
    }
  }, [refreshAllData, toast]);

  // ----------------------------------------------------
  // EVENT ACTIONS
  // ----------------------------------------------------
  const addEvent = useCallback(async (eventData) => {
    try {
      const res = await apiClient.createEvent(eventData);
      toast.success('Event organized successfully!');
      await refreshAllData();
      return res;
    } catch (err) {
      toast.error('Failed to create event: ' + err.message);
      throw err;
    }
  }, [refreshAllData, toast]);

  const deleteEvent = useCallback(async (id) => {
    try {
      const res = await apiClient.deleteEvent(id);
      toast.info(res.message || 'Event cancelled.');
      await refreshAllData();
    } catch (err) {
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.info('Event removed.');
    }
  }, [refreshAllData, toast]);

  const registerForEvent = useCallback(async (eventId, { residentName, flatNumber, attendees = 1 }) => {
    try {
      const res = await apiClient.rsvpEvent(eventId, { residentName, flatNumber, attendees });
      toast.success(res.message || 'RSVP Confirmed!');
      await refreshAllData();
      return { success: true };
    } catch (err) {
      toast.warning(err.message);
      return { success: false, message: err.message };
    }
  }, [refreshAllData, toast]);

  // ----------------------------------------------------
  // ANNOUNCEMENT ACTIONS
  // ----------------------------------------------------
  const addAnnouncement = useCallback(async (data) => {
    try {
      const res = await apiClient.createAnnouncement(data);
      toast.success('Notice published to community!');
      await refreshAllData();
      return res;
    } catch (err) {
      toast.error('Failed to publish notice: ' + err.message);
      throw err;
    }
  }, [refreshAllData, toast]);

  const deleteAnnouncement = useCallback(async (id) => {
    try {
      const res = await apiClient.deleteAnnouncement(id);
      toast.info(res.message || 'Notice removed.');
      await refreshAllData();
    } catch (err) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.info('Notice removed.');
    }
  }, [refreshAllData, toast]);

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.info('All notifications marked as read.');
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.info('All notifications marked as read.');
    }
  }, [toast]);

  // ----------------------------------------------------
  // RESET DEMO DATA
  // ----------------------------------------------------
  const handleResetData = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiClient.resetDemoData();
      await refreshAllData();
      resetLocalData();
      toast.success('SQLite database & demo records restored to clean state!');
    } catch (err) {
      const pristine = resetLocalData();
      setComplaints(pristine.complaints);
      setAnnouncements(pristine.announcements);
      setEvents(pristine.events);
      setResidents(pristine.residents);
      setNotifications(pristine.notifications);
      toast.success('Local demo data reset successfully!');
    } finally {
      setIsLoading(false);
    }
  }, [refreshAllData, toast]);

  return (
    <AppContext.Provider
      value={{
        complaints,
        announcements,
        events,
        residents,
        notifications,
        isLoading,
        backendStatus,
        activeTab,
        setActiveTab,
        refreshAllData,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        addAnnouncement,
        deleteAnnouncement,
        addEvent,
        deleteEvent,
        registerForEvent,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        handleResetData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
