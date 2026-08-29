'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getSession, login, logout } from '@/lib/api/auth';
import { queryKeys } from './keys';

/**
 * The signed-in user, or `null`.
 *
 * `staleTime: Infinity` on purpose: the session lives in the API's memory and
 * changes only when this app changes it (sign in, sign out, an admin editing
 * their own account) or when the server rejects a call — and a 401 from any
 * other query is what surfaces that. Polling `/auth/session` would add a
 * request per interval and tell us nothing new.
 *
 * The paths that DO change it invalidate `queryKeys.session` explicitly:
 * `useLogin`, `useLogout`, and `useUpdateUser` in `queries/admin.ts`.
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    staleTime: Infinity,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.session, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    // Clear the whole cache, not just the session: nothing an admin was looking
    // at should still be in memory for whoever signs in next on a shared laptop.
    onSettled: () => {
      queryClient.clear();
      router.replace('/prijava');
    },
  });
}
