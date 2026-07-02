import { useCallback, useState } from 'react';
import { useFetch } from '@hooks/useFetch';
import { usersApi } from '../api/usersApi';

export function useUsers({ search, status, page = 1, pageSize = 8 }) {
  const { data, isLoading, error, refetch } = useFetch(
    () => usersApi.list({ search, status, page, pageSize }),
    [search, status, page, pageSize]
  );

  return {
    users: data?.data || [],
    meta: data?.meta || { page, page_size: pageSize, total: 0, total_pages: 1 },
    isLoading,
    error,
    refetch,
  };
}

export function useUserMutations({ onChange } = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteUser = useCallback(
    async (payload) => {
      setIsSubmitting(true);
      try {
        const { data } = await usersApi.invite(payload);
        onChange?.();
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onChange]
  );

  const updateRole = useCallback(
    async (id, role) => {
      setIsSubmitting(true);
      try {
        const { data } = await usersApi.updateRole(id, role);
        onChange?.();
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onChange]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      setIsSubmitting(true);
      try {
        const { data } = await usersApi.updateStatus(id, status);
        onChange?.();
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onChange]
  );

  const deactivateUser = useCallback(
    async (id) => {
      setIsSubmitting(true);
      try {
        const { data } = await usersApi.deactivate(id);
        onChange?.();
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onChange]
  );

  return { inviteUser, updateRole, updateStatus, deactivateUser, isSubmitting };
}
