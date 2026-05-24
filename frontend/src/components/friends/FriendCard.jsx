import { Link } from 'react-router-dom';
import { User, UserMinus } from 'lucide-react';
import { useState } from 'react';
import { useFriends } from '../../utils/FriendsContext';

export default function FriendCard({ friend }) {
  const { removeFriend } = useFriends();
  const [removing, setRemoving] = useState(false);
  const profile = friend.profile || {};
  const name = profile.display_name || (profile.username ? `@${profile.username}` : 'Unknown');

  const onRemove = async () => {
    if (!window.confirm(`Remove ${name} as a friend?`)) return;
    setRemoving(true);
    try {
      await removeFriend(friend.friendId);
    } catch (e) {
      alert('Failed to remove friend: ' + e.message);
      setRemoving(false);
    }
  };

  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between gap-3">
      <Link to={`/friends/${friend.friendId}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-90">
        <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">{name}</div>
          {profile.username && profile.display_name && (
            <div className="text-white/50 text-sm truncate">@{profile.username}</div>
          )}
        </div>
      </Link>
      <button
        onClick={onRemove}
        disabled={removing}
        title="Remove friend"
        className="p-2 text-white/50 hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <UserMinus size={18} />
      </button>
    </div>
  );
}
