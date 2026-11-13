import React, { useState } from 'react';
import { PhMagnifyingGlass } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import { patientsService, type ApiPatient } from '../../services/patientsService';

type LookupKind = 'phone' | 'healora_code' | 'appointment_code';

export const PatientsOperationalView: React.FC = () => {
  const { t, selectedHubId, checkInAppointment, showToast } = useApp();
  const [lookupKind, setLookupKind] = useState<LookupKind>('phone');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ApiPatient | null>(null);
  const [appointment, setAppointment] = useState<{ id: string; code: string; status: string; sessionId: string; hubId: string } | null>(null);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedHubId || !query.trim()) return;
    setLoading(true);
    try {
      const response = await patientsService.lookup({ by: lookupKind, value: query.trim(), hubId: selectedHubId });
      setResults(response.matches);
      setAppointment(response.appointment);
      setSelectedPatient(null);
      setIdentityConfirmed(false);
      if (!response.matches.length && !response.appointment) showToast('No matching API patient or appointment was found.');
    } catch (error) {
      setResults([]);
      setAppointment(null);
      showToast(error instanceof Error ? error.message : 'Patient lookup failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">Patient identity lookup</div>
        <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navPatients}</h1>
        <p className="mt-1 text-sm text-slate">Search only returns records authorized by the backend for the selected hub.</p>
      </div>

      <Card variant="card" className="mb-5">
        <form onSubmit={lookup} className="flex flex-wrap items-center gap-3">
          <PhMagnifyingGlass size={18} color="#1D6B66" />
          <select value={lookupKind} onChange={(event) => setLookupKind(event.target.value as LookupKind)} className="h-11 rounded-xl border border-line bg-paper px-3 text-sm">
            <option value="phone">Phone number</option>
            <option value="healora_code">Healora ID</option>
            <option value="appointment_code">Appointment code</option>
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} required placeholder="Enter exact identifier" className="h-11 min-w-56 flex-1 rounded-xl border border-line px-3 text-sm" />
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Searching…' : 'Search API'}</Button>
        </form>
      </Card>

      {appointment && (
        <Card variant="card" className="mb-5">
          <h2 className="mt-0 text-base font-semibold text-ink">Matching appointment</h2>
          <p className="text-sm text-slate">Code: {appointment.code} · Status: {appointment.status}</p>
          <label className="mb-3 flex items-center gap-2 text-sm text-slate"><input type="checkbox" checked={identityConfirmed} onChange={(event) => setIdentityConfirmed(event.target.checked)} />I confirmed the patient identity against the appointment.</label>
          <Button variant="primary" disabled={!identityConfirmed} onClick={() => void checkInAppointment(appointment.id)}>Check in through API</Button>
        </Card>
      )}

      <Card variant="card" className="p-0! overflow-hidden">
        {results.length === 0 ? <p className="m-0 p-6 text-sm text-slate">Run a patient lookup to display backend records.</p> : (
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-line bg-bone text-xs uppercase text-slate"><th className="px-5 py-3">Healora ID</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Age / Sex</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Record</th></tr></thead>
            <tbody>{results.map((patient) => <tr key={patient.id} className="border-b border-line text-sm">
              <td className="px-5 py-4 font-mono">{patient.healoraCode}</td>
              <td className="px-5 py-4">{patient.fullName}</td>
              <td className="px-5 py-4">{patient.age ?? '—'} / {patient.sex}</td>
              <td className="px-5 py-4">{patient.maskedPhone ?? '—'}</td>
              <td className="px-5 py-4"><button type="button" className="font-semibold text-teal" onClick={() => setSelectedPatient(patient)}>View API record</button></td>
            </tr>)}</tbody>
          </table>
        )}
      </Card>

      <ModalSheet isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient API record">
        {selectedPatient && <div className="space-y-2 text-sm text-slate">
          <div>Patient ID: <span className="font-mono">{selectedPatient.id}</span></div>
          <div>Healora ID: {selectedPatient.healoraCode}</div>
          <div>Name: {selectedPatient.fullName}</div>
          {selectedPatient.fullNameBn && <div>Name (Bangla): {selectedPatient.fullNameBn}</div>}
          <div>Phone: {selectedPatient.maskedPhone ?? 'Not returned'}</div>
          <div>Date of birth: {selectedPatient.dateOfBirth ?? 'Not returned'}</div>
          <div>Registered hub ID: {selectedPatient.registeredHubId ?? 'Not returned'}</div>
          <div>Status: {selectedPatient.status ?? 'Not returned'}</div>
        </div>}
      </ModalSheet>
    </div>
  );
};