import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import * as storage from '@/lib/storage';
import { UserProfile } from '@/lib/types';

type UserStore = {
  loading: boolean;
  users: UserProfile[];
  activeUser: UserProfile | null;
  addUser: (name: string) => Promise<void>;
  switchUser: (id: string) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
};

const UserContext = createContext<UserStore | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [loadedUsers, storedActiveId] = await Promise.all([
        storage.getUsers(),
        storage.getActiveUserId(),
      ]);
      const validActiveId = loadedUsers.some((user) => user.id === storedActiveId)
        ? storedActiveId
        : (loadedUsers[0]?.id ?? null);

      setUsers(loadedUsers);
      setActiveUserId(validActiveId);
      setLoading(false);
    })();
  }, []);

  const addUser = useCallback(async (name: string) => {
    const next = await storage.createUser(name);
    setUsers(next);
    setActiveUserId(next[next.length - 1].id);
  }, []);

  const switchUser = useCallback(async (id: string) => {
    await storage.setActiveUserId(id);
    setActiveUserId(id);
  }, []);

  const removeUser = useCallback(async (id: string) => {
    const next = await storage.deleteUser(id);
    setUsers(next);
    setActiveUserId(await storage.getActiveUserId());
  }, []);

  const activeUser = users.find((user) => user.id === activeUserId) ?? null;

  return (
    <UserContext.Provider value={{ loading, users, activeUser, addUser, switchUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
