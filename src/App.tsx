import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { TopHeader } from './components/navigation/TopHeader';
import { BangladeshBanner } from './components/common/BangladeshBanner';
import { CommandPalette } from './components/navigation/CommandPalette';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { HubsView } from './components/views/HubsView';
import { SessionsCampsView } from './components/views/SessionsCampsView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { LiveQueueView } from './components/views/LiveQueueView';
import { PatientsOperationalView } from './components/views/PatientsOperationalView';
import { TeamRosterView } from './components/views/TeamRosterView';
import { StationsEquipmentView } from './components/views/StationsEquipmentView';
import { SyncMonitorExceptionsView } from './components/views/SyncMonitorExceptionsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsAuditView } from './components/views/SettingsAuditView';
import { PhCheckCircle } from './components/icons/PhosphorIcons';

const AppContent: React.FC = () => {
  const { activeView, toast } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'hubs':
        return <HubsView />;
      case 'sessions':
        return <SessionsCampsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'queue':
        return <LiveQueueView />;
      case 'patients':
        return <PatientsOperationalView />;
      case 'team':
        return <TeamRosterView />;
      case 'equipment':
        return <StationsEquipmentView />;
      case 'reports':
        return <ReportsView />;
      case 'exceptions':
        return <SyncMonitorExceptionsView />;
      case 'audit':
        return <SettingsAuditView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F5F3EE', // Bone
        fontFamily: 'var(--ui)',
        color: '#0B1F22',
      }}
    >
      {/* 248px Desktop Sidebar (Design System Ch 12) */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Compliance & Data Residency Top Banner */}
        <BangladeshBanner />

        {/* Global Top App Header */}
        <TopHeader />

        {/* Dynamic View Canvas */}
        <main style={{ flex: 1, paddingBottom: '60px' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Quick Search & Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Organic Toast Notification (Design System Ch 7.9: Toast ink, r14 sits 118px above the bottom) */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '118px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0B1F22', // Ink
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '14px',
            boxShadow: '0 12px 32px -10px rgba(11,31,34,.28)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 1000,
            animation: 'fadeInUp 0.25s cubic-bezier(.2,.8,.2,1)',
          }}
        >
          <PhCheckCircle size={18} color="#8FB3A3" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
