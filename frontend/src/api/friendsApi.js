import { getSupabase } from '../utils/supabase';

async function requireUserId() {
  const sb = getSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) throw new Error('Not signed in.');
  return data.user.id;
}

export async function getMyProfile() {
  const sb = getSupabase();
  const uid = await requireUserId();
  const { data, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: inserted, error: insErr } = await sb
      .from('profiles')
      .insert({ id: uid })
      .select()
      .single();
    if (insErr) throw new Error(insErr.message);
    return inserted;
  }
  return data;
}

export async function updateMyProfile(updates) {
  const sb = getSupabase();
  const uid = await requireUserId();
  const payload = {};
  ['username', 'display_name', 'bio', 'avatar_url'].forEach((k) => {
    if (updates[k] !== undefined) payload[k] = updates[k] === '' ? null : updates[k];
  });
  const { data, error } = await sb.from('profiles').update(payload).eq('id', uid).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function searchUsers(query) {
  const sb = getSupabase();
  const uid = await requireUserId();
  const q = (query || '').trim();
  if (!q) return [];

  const results = new Map();
  const handle = q.replace(/^@/, '');
  if (handle) {
    const { data, error } = await sb
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('username', `${handle}%`)
      .limit(15);
    if (error) throw new Error(error.message);
    (data || []).forEach((p) => {
      if (p.id !== uid) results.set(p.id, p);
    });
  }

  if (q.includes('@') && q.includes('.')) {
    const { data: foundId, error: rpcErr } = await sb.rpc('find_user_by_email', { p_email: q });
    if (rpcErr) throw new Error(rpcErr.message);
    if (foundId && foundId !== uid && !results.has(foundId)) {
      const { data: prof } = await sb
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', foundId)
        .maybeSingle();
      results.set(foundId, prof || { id: foundId });
    }
  }

  return Array.from(results.values());
}

export async function sendRequest(recipientId) {
  const sb = getSupabase();
  const uid = await requireUserId();
  if (recipientId === uid) throw new Error("Can't friend yourself.");

  const { data: existingAny } = await sb
    .from('friend_requests')
    .select('*')
    .or(
      `and(requester_id.eq.${uid},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${uid})`
    )
    .limit(1);
  const existing = existingAny?.[0];

  if (existing) {
    if (existing.status === 'accepted') throw new Error('Already friends.');
    if (existing.status === 'pending') throw new Error('Request already pending.');
    if (existing.status === 'rejected' && existing.requester_id === uid) {
      const { data, error } = await sb
        .from('friend_requests')
        .update({ status: 'pending' })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
  }

  const { data, error } = await sb
    .from('friend_requests')
    .insert({ requester_id: uid, recipient_id: recipientId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function acceptRequest(requestId) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function rejectRequest(requestId) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function cancelRequest(requestId) {
  const sb = getSupabase();
  const { error } = await sb.from('friend_requests').delete().eq('id', requestId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function removeFriend(friendId) {
  const sb = getSupabase();
  const uid = await requireUserId();
  const { error } = await sb
    .from('friend_requests')
    .delete()
    .or(
      `and(requester_id.eq.${uid},recipient_id.eq.${friendId}),and(requester_id.eq.${friendId},recipient_id.eq.${uid})`
    );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getPendingRequests() {
  const sb = getSupabase();
  const uid = await requireUserId();
  const { data, error } = await sb
    .from('friend_requests')
    .select('*')
    .eq('status', 'pending')
    .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`);
  if (error) throw new Error(error.message);

  const rows = data || [];
  const otherIds = Array.from(
    new Set(rows.map((r) => (r.requester_id === uid ? r.recipient_id : r.requester_id)))
  );

  const profiles = await fetchProfiles(otherIds);
  const incoming = [];
  const outgoing = [];
  rows.forEach((r) => {
    const otherId = r.requester_id === uid ? r.recipient_id : r.requester_id;
    const entry = { ...r, profile: profiles[otherId] || { id: otherId } };
    if (r.recipient_id === uid) incoming.push(entry);
    else outgoing.push(entry);
  });
  return { incoming, outgoing };
}

export async function getFriends() {
  const sb = getSupabase();
  const uid = await requireUserId();
  const { data, error } = await sb
    .from('friend_requests')
    .select('*')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`);
  if (error) throw new Error(error.message);

  const rows = data || [];
  const friendIds = rows.map((r) => (r.requester_id === uid ? r.recipient_id : r.requester_id));
  const profiles = await fetchProfiles(friendIds);
  return rows.map((r) => {
    const fid = r.requester_id === uid ? r.recipient_id : r.requester_id;
    return { friendshipId: r.id, friendId: fid, profile: profiles[fid] || { id: fid }, since: r.updated_at };
  });
}

async function fetchProfiles(ids) {
  if (!ids?.length) return {};
  const sb = getSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .in('id', ids);
  if (error) throw new Error(error.message);
  const map = {};
  (data || []).forEach((p) => {
    map[p.id] = p;
  });
  return map;
}

export async function getFriendMovies(friendId, params = {}) {
  const sb = getSupabase();
  let q = sb.from('movies').select('*').eq('user_id', friendId);
  if (params.type) q = q.eq('type', params.type);
  q = q.order('date_watched', { ascending: false, nullsFirst: false });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}
