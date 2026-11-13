import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { TopHeader } from './components/navigation/TopHeader';
import { BangladeshBanner } from './components/common/BangladeshBanner';
import { CommandPalette } from './components/navigation/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { HubsView } from './components/views/HubsView';
import { RegionsCatchmentView } from './components/views/RegionsCatchmentView';
import { SessionsCampsView } from './components/views/SessionsCampsView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { LiveQueueView } from './components/views/LiveQueueView';
import { PatientsOperationalView } from './components/views/PatientsOperationalView';
import { TeamRosterView } from './components/views/TeamRosterView';
import { StationsView } from './components/views/StationsView';
import { EquipmentView } from './components/views/EquipmentView';
import { EncounterMonitoringView } from './components/views/EncounterMonitoringView';
import { ExceptionsEscalationsView } from './components/views/ExceptionsEscalationsView';
import { ReportsView } from './components/views/ReportsView';
import { NotificationsActivityView } from './components/views/NotificationsActivityView';
import { SettingsPermissionsView } from './components/views/SettingsPermissionsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { CatalogGovernanceView } from './components/views/CatalogGovernanceView';
import { PhCheckCircle } from './components/icons/PhosphorIcons';

const AppContent: React.FC = () => {
  const { activeView, toast, isAuthModalOpen, setIsAuthModalOpen, isReadOnlyRole, isAuthenticated } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case '/dashboard':
        return <OverviewDashboard />;
      case '/hubs':
        return <HubsView />;
      case '/regions':
        return <RegionsCatchmentView />;
      case '/sessions':
        return <SessionsCampsView />;
      case '/appointments':
        return <AppointmentsView />;
      case '/queue':
        return <LiveQueueView />;
      case '/patients':
        return <PatientsOperationalView />;
      case '/team':
        return <TeamRosterView />;
      case '/stations':
        return <StationsView />;
      case '/equipment':
        return <EquipmentView />;
      case '/encounters':
        return <EncounterMonitoringView />;
      case '/exceptions':
        return <ExceptionsEscalationsView />;
      case '/reports':
        return <ReportsView />;
      case '/notifications':
        return <NotificationsActivityView />;
      case '/settings':
        return <SettingsPermissionsView />;
      case '/audit-logs':
        return <AuditLogsView />;
      case '/catalog':
        return <CatalogGovernanceView />;
      default:
        return <OverviewDashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bone font-ui text-ink">
        <AuthModal isOpen onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bone font-ui text-ink">
      {/* 260px Desktop Sidebar (Design System Ch 12) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Live backend connection status */}
        <BangladeshBanner />

        {/* Global Top App Header with Live API Connection indicator */}
        <TopHeader />

        {/* Read-Only Auditor Mode Notice */}
        {isReadOnlyRole && (
          <div className="flex items-center justify-between border-b border-bad/20 bg-bad-bg/60 px-7 py-2 text-xs text-bad-fg">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider">Read-Only Operations Auditor Mode</span>
              <span>•</span>
              <span>Operational write actions are disabled. Reports and Immutable Audit Trail inspection are active.</span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-bad">Least-Privilege Scoped</span>
          </div>
        )}

        {/* Dynamic View Canvas */}
        <main className="flex-1 pb-[60px]">
          {renderActiveView()}
        </main>
      </div>

      {/* Quick Search & Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Staff Authentication & Live Backend Diagnostics Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Organic Toast Notification */}
      {toast && (
        <div className="fixed bottom-[118px] left-1/2 z-[1000] flex -translate-x-1/2 animate-fade-up items-center gap-2.5 rounded-ctl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-float">
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
