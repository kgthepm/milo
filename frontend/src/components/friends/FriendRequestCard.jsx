import { Check, X, User } from 'lucide-react';
import { useState } from 'react';
import { useFriends } from '../../utils/FriendsContext';

export default function FriendRequestCard({ request, direction }) {
  const { acceptRequest, rejectRequest, cancelRequest } = useFriends();
  const [busy, setBusy] = useState(false);
  const profile = request.profile || {};
  const name = profile.display_name || (profile.username ? `@${profile.username}` : 'Unknown user');

  const wrap = (fn) => async () => {
    setBusy(true);
    try {
      await fn(request.id);
    } catch (e) {
      alert(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-neon-magenta/20 flex items-center justify-center text-neon-magenta flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">{name}</div>
          <div className="text-white/50 text-xs">
            {direction === 'incoming' ? 'wants to be your friend' : 'request sent'}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {direction === 'incoming' ? (
          <>
            <button
              onClick={wrap(acceptRequest)}
              disabled={busy}
              className="p-2 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 disabled:opacity-50"
              title="Accept"
            >
              <Check size={18} />
            </button>
            <button
              onClick={wrap(rejectRequest)}
              disabled={busy}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
              title="Reject"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={wrap(cancelRequest)}
            disabled={busy}
            className="px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
