// src/App.jsx
import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ComplaintList } from './components/complaints/ComplaintList';
import { AiAssistantPanel } from './components/complaints/AiAssistantPanel';
import { ComplaintFormModal } from './components/complaints/ComplaintFormModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { EventList } from './components/events/EventList';
import { EventFormModal } from './components/events/EventFormModal';
import { AnnouncementList } from './components/announcements/AnnouncementList';
import { AnnouncementFormModal } from './components/announcements/AnnouncementFormModal';
import { ResidentList } from './components/residents/ResidentList';
import { NotificationCenter } from './components/notifications/NotificationCenter';

// Import design system CSS
import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';

function MainAppContent() {
  const {
    activeTab,
    setActiveTab,
    addComplaint,
    addEvent,
    addAnnouncement,
    residents
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Modal states
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const [preFillComplaintData, setPreFillComplaintData] = useState(null);

  // Triggered from AI Assistant Panel
  const handleApplyAiSuggestion = (suggestionData) => {
    setPreFillComplaintData(suggestionData);
    setIsNewComplaintOpen(true);
  };

  // Triggered from Resident Directory
  const handleStartComplaintForResident = (resident) => {
    setPreFillComplaintData({
      residentName: resident.name,
      flatNumber: resident.flatNumber,
      category: 'Plumbing',
      priority: 'Medium'
    });
    setIsNewComplaintOpen(true);
  };

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          onMobileMenuToggle={() => setIsSidebarOpen(prev => !prev)}
          onOpenNewComplaint={() => {
            setPreFillComplaintData(null);
            setIsNewComplaintOpen(true);
          }}
        />

        <main className="content-body fade-in">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onOpenNewComplaint={() => {
                setPreFillComplaintData(null);
                setIsNewComplaintOpen(true);
              }}
              onOpenNewEvent={() => setIsNewEventOpen(true)}
              onOpenNewAnnouncement={() => setIsNewAnnouncementOpen(true)}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintList
              initialPreFill={preFillComplaintData}
              onClearPreFill={() => setPreFillComplaintData(null)}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <div>
              <AiAssistantPanel onApplyToForm={handleApplyAiSuggestion} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'events' && (
            <EventList />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementList />
          )}

          {activeTab === 'residents' && (
            <ResidentList
              onStartComplaintForResident={handleStartComplaintForResident}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationCenter />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {isNewComplaintOpen && (
        <ComplaintFormModal
          isOpen={isNewComplaintOpen}
          onClose={() => {
            setIsNewComplaintOpen(false);
            setPreFillComplaintData(null);
          }}
          onSubmit={(data) => {
            addComplaint(data);
            setIsNewComplaintOpen(false);
            setPreFillComplaintData(null);
          }}
          initialData={preFillComplaintData}
          residentsList={residents}
        />
      )}

      {isNewEventOpen && (
        <EventFormModal
          isOpen={isNewEventOpen}
          onClose={() => setIsNewEventOpen(false)}
          onSubmit={(data) => {
            addEvent(data);
            setIsNewEventOpen(false);
          }}
        />
      )}

      {isNewAnnouncementOpen && (
        <AnnouncementFormModal
          isOpen={isNewAnnouncementOpen}
          onClose={() => setIsNewAnnouncementOpen(false)}
          onSubmit={(data) => {
            addAnnouncement(data);
            setIsNewAnnouncementOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ToastProvider>
  );
}
