/**
 * Healora Live Queue & Walk-ins Service
 * Endpoints from hello.md:
 * - GET /sessions/{sessionId}/queue
 * - POST /sessions/{sessionId}/walk-ins
 * - POST /queue-tickets/{id}/call
 * - POST /queue-tickets/{id}/start
 * - POST /queue-tickets/{id}/transfer
 * - POST /queue-tickets/{id}/pause
 * - POST /queue-tickets/{id}/resume
 * - POST /queue-tickets/{id}/delay
 * - POST /queue-tickets/{id}/priority
 * - POST /queue-tickets/{id}/no-show
 * - POST /queue-tickets/{id}/cancel
 * - POST /queue-tickets/{id}/complete
 * - POST /queue-tickets/{id}/reopen
 * - GET /queue-tickets/{id}/history
 * - GET /display/sessions/{sessionId}/board
 * - GET /sessions/{sessionId}/queue/stream (SSE)
 */

import { apiRequest, API_BASE, getStoredAccessToken } from './apiClient';

export interface ApiQueueTicket {
  id: string;
  displayCode: string; // e.g. "A-001" or "W-002"
  ticketNumber: number;
  status: 'waiting' | 'called' | 'in_service' | 'awaiting_review' | 'transferred' | 'paused' | 'completed' | 'no_show' | 'cancelled';
  priorityLevel: number; // 0=normal, 1=urgent, 2=critical
  delayReason?: string | null;
  station?: {
    id: string;
    name: string;
    code?: string;
    stationType?: string;
  } | null;
  issuedAt: string;
  calledAt?: string | null;
  serviceStartedAt?: string | null;
  waitingMinutes: number;
  encounter?: {
    id: string;
    status?: string;
  } | null;
  patient?: { id?: string; healoraCode: string; firstName: string } | null;
  appointmentId?: string | null;
  assignedStaff?: Array<{ userId: string; name?: string | null; role: string; status: string }>;
}

export interface SessionQueueResponse {
  sessionId: string;
  lastUpdated: string;
  generatedAt: string;
  items: ApiQueueTicket[];
}

export interface WalkInResponse {
  appointment: Record<string, unknown>;
  encounter: { id: string; status: string };
  ticket: ApiQueueTicket;
  alreadyCheckedIn: boolean;
}

export interface QueueHistoryEvent {
  id: string;
  timestamp: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  stationName?: string;
  staffName?: string;
  notes?: string;
}

export const queueService = {
  /**
   * Get current queue for a session
   */
  async getQueue(sessionId: string, includeClosed = false): Promise<SessionQueueResponse> {
    return apiRequest<SessionQueueResponse>(`/sessions/${sessionId}/queue`, {
      params: { includeClosed: includeClosed ? 'true' : 'false' },
    });
  },

  /**
   * Register a walk-in patient directly into the session queue
   */
  async registerWalkIn(
    sessionId: string,
    data: {
      patientId: string;
      identityConfirmed: true;
      idempotencyKey?: string;
    }
  ): Promise<WalkInResponse> {
    return apiRequest<WalkInResponse>(`/sessions/${sessionId}/walk-ins`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Call a ticket to a station (e.g. flashing on display board)
   */
  async callTicket(ticketId: string, _stationId: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/call`, { method: 'POST' });
  },

  /**
   * Start service for a called ticket
   */
  async startTicket(ticketId: string, _stationId: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/start`, { method: 'POST' });
  },

  /**
   * Transfer patient ticket to another station (e.g. Vitals -> Doctor consultation)
   */
  async transferTicket(
    ticketId: string,
    data: { stationId: string; reason?: string }
  ): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/transfer`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Pause ticket (e.g. waiting for lab result or rest before BP measurement)
   */
  async pauseTicket(ticketId: string, reason?: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/pause`, {
      method: 'POST',
      json: { reason },
    });
  },

  /**
   * Resume paused ticket back to waiting state
   */
  async resumeTicket(ticketId: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/resume`, {
      method: 'POST',
      json: {},
    });
  },

  /**
   * Add temporary delay to ticket
   */
  async delayTicket(ticketId: string, delayReason: string | null): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/delay`, {
      method: 'POST',
      json: { delayReason },
    });
  },

  /**
   * Update queue ticket priority (e.g. elderly / pregnant / emergency)
   */
  async setPriority(ticketId: string, policyId: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/priority`, {
      method: 'POST',
      json: { policyId },
    });
  },

  /**
   * Mark ticket as no-show after multiple calls
   */
  async markNoShow(ticketId: string, reason?: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/no-show`, {
      method: 'POST',
      json: { reason },
    });
  },

  /**
   * Cancel ticket
   */
  async cancelTicket(ticketId: string, reason: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/cancel`, {
      method: 'POST',
      json: { reason },
    });
  },

  /**
   * Complete ticket service
   */
  async completeTicket(ticketId: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/complete`, {
      method: 'POST',
      json: {},
    });
  },

  /**
   * Reopen accidentally completed/cancelled ticket
   */
  async reopenTicket(ticketId: string, reason: string): Promise<ApiQueueTicket> {
    return apiRequest<ApiQueueTicket>(`/queue-tickets/${ticketId}/reopen`, {
      method: 'POST',
      json: { reason },
    });
  },

  /**
   * Get ticket progression audit history
   */
  async getTicketHistory(ticketId: string): Promise<QueueHistoryEvent[]> {
    return apiRequest<QueueHistoryEvent[]>(`/queue-tickets/${ticketId}/history`);
  },

  /**
   * Get public TV display board data for waiting hall
   */
  async getDisplayBoard(sessionId: string): Promise<{
    nowServing: Array<{ ticket: string; station: string }>;
    waiting: Array<{ ticket: string; estimatedMinutes: number }>;
  }> {
    return apiRequest(`/display/sessions/${sessionId}/board`);
  },

  /**
   * Connect to real-time Server-Sent Events (SSE) stream for session queue
   * Auto-reconnects and informs subscriber when queue state changes
   */
  subscribeQueueStream(
    sessionId: string,
    onQueueUpdate: () => void,
    onError?: (err: unknown) => void
  ): () => void {
    const token = getStoredAccessToken();
    const abortController = new AbortController();

    // Use fetch with streaming reader to pass Authorization header
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}/queue/stream`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'text/event-stream',
          },
          signal: abortController.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!abortController.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const chunk of lines) {
            if (chunk.includes('event: queue') || chunk.includes('event: ready')) {
              onQueueUpdate();
            }
          }
        }
      } catch (err) {
        if (!abortController.signal.aborted && onError) {
          onError(err);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  },
};

