import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Link2, ShieldCheck, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AUTH_CHANGED_EVENT,
  clearStoredAuthSession,
  createEvent,
  createInvite,
  deleteEvent,
  getAuthMe,
  getEvents,
  getPendingInvites,
  getStoredAuthToken,
  getStoredAuthUser,
  revokeInvite,
  setStoredAuthSession,
  updateEvent,
  type Event,
  type EventCreatePayload,
  type InviteTokenRecord,
  type StoredAuthUser,
} from '@/api/publicApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'general_meeting', label: 'General Meeting' },
  { value: 'food_drive', label: 'Food Drive' },
  { value: 'other', label: 'Other' },
] as const;

type EventFormState = {
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_type: '' | 'general_meeting' | 'food_drive' | 'other';
};

const EMPTY_EVENT_FORM: EventFormState = {
  title: '',
  description: '',
  location: '',
  event_date: '',
  event_type: '',
};

function toDateTimeLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromEventToForm(event: Event): EventFormState {
  return {
    title: event.title,
    description: event.description ?? '',
    location: event.location ?? '',
    event_date: toDateTimeLocalInput(event.event_date),
    event_type:
      event.event_type === 'general_meeting' || event.event_type === 'food_drive' || event.event_type === 'other'
        ? event.event_type
        : '',
  };
}

function normalizeEventPayload(form: EventFormState): EventCreatePayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() ? form.description.trim() : null,
    location: form.location.trim() ? form.location.trim() : null,
    event_date: new Date(form.event_date).toISOString(),
    event_type: form.event_type || null,
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => getStoredAuthToken());
  const [role, setRole] = useState<string | null>(() => getStoredAuthUser()?.role ?? null);
  const [initializingAuth, setInitializingAuth] = useState(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [invites, setInvites] = useState<InviteTokenRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [savingCreate, setSavingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [generatedInviteId, setGeneratedInviteId] = useState<string | null>(null);
  const [generatedInviteExpiresAt, setGeneratedInviteExpiresAt] = useState<string | null>(null);
  const [copyInviteStatus, setCopyInviteStatus] = useState<string | null>(null);

  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  const syncSession = useCallback(async () => {
    const storedToken = getStoredAuthToken();
    const fallbackUser = getStoredAuthUser();

    if (!storedToken) {
      setToken(null);
      setRole(null);
      setInitializingAuth(false);
      return;
    }

    try {
      const me = await getAuthMe(storedToken);
      const normalizedUser: StoredAuthUser = {
        id: me.user.id,
        email: me.user.email ?? fallbackUser?.email ?? 'unknown@projectwampus.local',
        role: me.role,
      };

      setStoredAuthSession(storedToken, normalizedUser);
      setToken(storedToken);
      setRole(me.role);
    } catch (error) {
      if (error instanceof TypeError) {
        setToken(storedToken);
        setRole(fallbackUser?.role ?? null);
      } else {
        clearStoredAuthSession();
        setToken(null);
        setRole(null);
      }
    } finally {
      setInitializingAuth(false);
    }
  }, []);

  useEffect(() => {
    void syncSession();

    const handleAuthChanged = () => {
      void syncSession();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [syncSession]);

  const isAdminOrOwner = useMemo(() => role === 'ADMIN' || role === 'OWNER', [role]);

  const loadData = useCallback(async () => {
    if (initializingAuth) {
      return;
    }

    if (!token || !isAdminOrOwner) {
      setLoadingData(false);
      setEvents([]);
      setInvites([]);
      return;
    }

    setLoadingData(true);
    setDataError(null);

    try {
      const [eventsPayload, invitesPayload] = await Promise.all([
        getEvents(false, 200, 0),
        getPendingInvites(token),
      ]);
      setEvents(eventsPayload);
      setInvites(invitesPayload);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to load admin data');
      setEvents([]);
      setInvites([]);
    } finally {
      setLoadingData(false);
    }
  }, [initializingAuth, isAdminOrOwner, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!initializingAuth && !token) {
      navigate('/login', { replace: true });
    }
  }, [initializingAuth, navigate, token]);

  const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    if (!token) {
      setCreateError('Missing auth token. Please log in again.');
      return;
    }

    if (!createForm.title.trim()) {
      setCreateError('Title is required.');
      return;
    }

    if (!createForm.event_date) {
      setCreateError('Event date is required.');
      return;
    }

    setSavingCreate(true);
    try {
      await createEvent(normalizeEventPayload(createForm), token);
      setCreateForm(EMPTY_EVENT_FORM);
      await loadData();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setSavingCreate(false);
    }
  };

  const startEditing = (event: Event) => {
    setEditingEventId(event.id);
    setEditForm(fromEventToForm(event));
    setEditError(null);
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingEventId) return;
    if (!token) {
      setEditError('Missing auth token. Please log in again.');
      return;
    }

    if (!editForm.title.trim()) {
      setEditError('Title is required.');
      return;
    }

    if (!editForm.event_date) {
      setEditError('Event date is required.');
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      await updateEvent(editingEventId, normalizeEventPayload(editForm), token);
      setEditingEventId(null);
      setEditForm(EMPTY_EVENT_FORM);
      await loadData();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) return;

    const shouldDelete = window.confirm('Delete this event?');
    if (!shouldDelete) return;

    try {
      await deleteEvent(eventId, token);
      if (editingEventId === eventId) {
        setEditingEventId(null);
        setEditForm(EMPTY_EVENT_FORM);
      }
      await loadData();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to delete event');
    }
  };

  const handleCreateInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setInviteError('Missing auth token. Please log in again.');
      return;
    }

    setInviteError(null);
    setGeneratedInviteUrl(null);
    setGeneratedInviteId(null);
    setGeneratedInviteExpiresAt(null);
    setCopyInviteStatus(null);

    setCreatingInvite(true);
    try {
      const response = await createInvite(token);
      setGeneratedInviteUrl(response.invite_url);
      setGeneratedInviteId(response.invite_id);
      setGeneratedInviteExpiresAt(response.expires_at);
      await loadData();
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to create invite');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!generatedInviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedInviteUrl);
      setCopyInviteStatus('Invite link copied.');
    } catch {
      setCopyInviteStatus('Unable to copy automatically. Please copy the link manually.');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!token) return;

    setRevokingInviteId(inviteId);
    try {
      await revokeInvite(inviteId, token);
      await loadData();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to revoke invite');
    } finally {
      setRevokingInviteId(null);
    }
  };

  return (
    <div>
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-white">ADMIN PANEL</h1>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto">
            Manage events and invite-only membership links.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 space-y-10">
        {!token && (
          <div className="bg-red-100 neo-brutal-border-thin p-4">
            <p className="font-bold text-red-700">You must be logged in to access admin tools.</p>
          </div>
        )}

        {token && !isAdminOrOwner && (
          <div className="bg-red-100 neo-brutal-border-thin p-4">
            <p className="font-bold text-red-700">Your account role ({role ?? 'unknown'}) does not have admin access.</p>
          </div>
        )}

        {dataError && (
          <div className="bg-yellow-100 neo-brutal-border-thin p-4">
            <p className="font-bold text-yellow-800">{dataError}</p>
          </div>
        )}

        {loadingData && (
          <div className="bg-white neo-brutal-border-thin p-4">
            <p className="font-bold">Loading admin data...</p>
          </div>
        )}

        {token && isAdminOrOwner && (
          <>
            <Card className="neo-brutal-border neo-brutal-shadow">
              <CardHeader className="bg-black text-white">
                <CardTitle className="font-black text-2xl flex items-center gap-2">
                  <CalendarPlus className="w-6 h-6" />
                  EVENTS MANAGEMENT
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <h3 className="text-xl font-black">Create Event</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black mb-2">TITLE</label>
                      <Input
                        required
                        value={createForm.title}
                        onChange={(e) => setCreateForm((current) => ({ ...current, title: e.target.value }))}
                        className="neo-brutal-border-thin font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-black mb-2">EVENT DATE / TIME</label>
                      <Input
                        required
                        type="datetime-local"
                        value={createForm.event_date}
                        onChange={(e) => setCreateForm((current) => ({ ...current, event_date: e.target.value }))}
                        className="neo-brutal-border-thin font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black mb-2">LOCATION</label>
                      <Input
                        value={createForm.location}
                        onChange={(e) => setCreateForm((current) => ({ ...current, location: e.target.value }))}
                        className="neo-brutal-border-thin font-bold"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block font-black mb-2">EVENT TYPE</label>
                      <select
                        value={createForm.event_type}
                        onChange={(e) =>
                          setCreateForm((current) => ({
                            ...current,
                            event_type: e.target.value as EventFormState['event_type'],
                          }))
                        }
                        className="w-full h-10 px-3 py-2 neo-brutal-border-thin font-bold bg-white"
                      >
                        {EVENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value || 'none'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-black mb-2">DESCRIPTION</label>
                    <Textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm((current) => ({ ...current, description: e.target.value }))}
                      className="neo-brutal-border-thin font-bold"
                      rows={4}
                      placeholder="Optional"
                    />
                  </div>

                  {createError && (
                    <div className="bg-red-100 neo-brutal-border-thin p-3">
                      <p className="font-bold text-red-700">{createError}</p>
                    </div>
                  )}

                  <Button type="submit" disabled={savingCreate} className="neo-button bg-[#22C55E]! text-white font-black">
                    {savingCreate ? 'CREATING...' : 'CREATE EVENT'}
                  </Button>
                </form>

                <div className="space-y-4">
                  <h3 className="text-xl font-black">Current Events</h3>
                  {events.length === 0 ? (
                    <div className="bg-[#F5F5F5] neo-brutal-border-thin p-4">
                      <p className="font-bold text-gray-700">No events yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="bg-white neo-brutal-border-thin p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-lg">{event.title}</p>
                              <p className="text-sm font-bold text-gray-700">
                                {new Date(event.event_date).toLocaleString()} • {event.location || 'No location'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={() => startEditing(event)}
                                className="neo-button bg-black! text-white font-black"
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                EDIT
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="neo-button bg-red-600! text-white font-black"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                DELETE
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editingEventId && (
                    <form onSubmit={handleSaveEdit} className="bg-[#F5F5F5] neo-brutal-border-thin p-4 space-y-4">
                      <p className="font-black text-lg">Edit Event</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          required
                          value={editForm.title}
                          onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))}
                          className="neo-brutal-border-thin font-bold"
                          placeholder="Title"
                        />
                        <Input
                          required
                          type="datetime-local"
                          value={editForm.event_date}
                          onChange={(e) => setEditForm((current) => ({ ...current, event_date: e.target.value }))}
                          className="neo-brutal-border-thin font-bold"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm((current) => ({ ...current, location: e.target.value }))}
                          className="neo-brutal-border-thin font-bold"
                          placeholder="Location"
                        />
                        <select
                          value={editForm.event_type}
                          onChange={(e) =>
                            setEditForm((current) => ({
                              ...current,
                              event_type: e.target.value as EventFormState['event_type'],
                            }))
                          }
                          className="w-full h-10 px-3 py-2 neo-brutal-border-thin font-bold bg-white"
                        >
                          {EVENT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value || 'none'} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))}
                        className="neo-brutal-border-thin font-bold"
                        rows={4}
                        placeholder="Description"
                      />

                      {editError && (
                        <div className="bg-red-100 neo-brutal-border-thin p-3">
                          <p className="font-bold text-red-700">{editError}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button type="submit" disabled={savingEdit} className="neo-button bg-[#22C55E]! text-white font-black">
                          {savingEdit ? 'SAVING...' : 'SAVE CHANGES'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingEventId(null);
                            setEditForm(EMPTY_EVENT_FORM);
                            setEditError(null);
                          }}
                          className="neo-button bg-white text-black font-black"
                        >
                          CANCEL
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="neo-brutal-border neo-brutal-shadow">
              <CardHeader className="bg-black text-white">
                <CardTitle className="font-black text-2xl flex items-center gap-2">
                  <Link2 className="w-6 h-6" />
                  INVITE MANAGEMENT
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <h3 className="text-xl font-black">Generate Member Invite Link</h3>
                  <p className="text-sm font-bold text-gray-700">
                    Generate a one-time invite link, then copy and share it manually.
                  </p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button type="submit" disabled={creatingInvite} className="neo-button bg-[#22C55E]! text-white font-black">
                      {creatingInvite ? 'GENERATING...' : 'GENERATE INVITE LINK'}
                    </Button>
                  </div>

                  {inviteError && (
                    <div className="bg-red-100 neo-brutal-border-thin p-3">
                      <p className="font-bold text-red-700">{inviteError}</p>
                    </div>
                  )}

                  {generatedInviteUrl && (
                    <div className="bg-[#DCFCE7] neo-brutal-border-thin p-3">
                      <p className="font-bold text-[#166534] mb-2">Invite link generated:</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Input readOnly value={generatedInviteUrl} className="neo-brutal-border-thin font-bold bg-white flex-1 min-w-[280px]" />
                        <Button
                          type="button"
                          onClick={handleCopyInviteLink}
                          className="neo-button bg-black! text-white font-black"
                        >
                          COPY
                        </Button>
                      </div>
                      {generatedInviteId && (
                        <p className="text-sm font-bold text-[#166534] mt-2">Invite ID: {generatedInviteId}</p>
                      )}
                      {generatedInviteExpiresAt && (
                        <p className="text-sm font-bold text-[#166534] mt-1">
                          Expires: {new Date(generatedInviteExpiresAt).toLocaleString()}
                        </p>
                      )}
                      {copyInviteStatus && <p className="text-sm font-bold text-[#166534] mt-2">{copyInviteStatus}</p>}
                    </div>
                  )}
                </form>

                <div>
                  <h3 className="text-xl font-black mb-3">Pending Invites</h3>
                  {invites.length === 0 ? (
                    <div className="bg-[#F5F5F5] neo-brutal-border-thin p-4">
                      <p className="font-bold text-gray-700">No pending invites.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invites.map((invite) => (
                        <div key={invite.id} className="bg-white neo-brutal-border-thin p-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-black">Invite ID: {invite.id}</p>
                            <p className="text-sm font-bold text-gray-700">
                              Expires {new Date(invite.expires_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleRevokeInvite(invite.id)}
                            disabled={revokingInviteId === invite.id}
                            className="neo-button bg-red-600! text-white font-black"
                          >
                            {revokingInviteId === invite.id ? 'REVOKING...' : 'REVOKE'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </div>
  );
}
