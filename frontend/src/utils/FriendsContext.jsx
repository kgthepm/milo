import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as friendsApi from '../api/friendsApi';
import { IS_CLOUD } from './mode';

const FriendsContext = createContext(null);

export function FriendsProvider({ children }) {
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!IS_CLOUD) return;
    setLoading(true);
    setError(null);
    try {
      const [f, p, profile] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getPendingRequests(),
        friendsApi.getMyProfile(),
      ]);
      setFriends(f);
      setIncoming(p.incoming);
      setOutgoing(p.outgoing);
      setMyProfile(profile);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendRequest = async (recipientId) => {
    await friendsApi.sendRequest(recipientId);
    await refresh();
  };
  const acceptRequest = async (id) => {
    await friendsApi.acceptRequest(id);
    await refresh();
  };
  const rejectRequest = async (id) => {
    await friendsApi.rejectRequest(id);
    await refresh();
  };
  const cancelRequest = async (id) => {
    await friendsApi.cancelRequest(id);
    await refresh();
  };
  const removeFriend = async (friendId) => {
    await friendsApi.removeFriend(friendId);
    await refresh();
  };
  const updateProfile = async (updates) => {
    const p = await friendsApi.updateMyProfile(updates);
    setMyProfile(p);
    return p;
  };

  return (
    <FriendsContext.Provider
      value={{
        friends,
        incoming,
        outgoing,
        myProfile,
        loading,
        error,
        refresh,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeFriend,
        updateProfile,
        searchUsers: friendsApi.searchUsers,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within a FriendsProvider');
  return ctx;
}
