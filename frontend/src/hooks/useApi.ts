import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseApiListOptions<T, P> {
  queryKey: unknown[];
  queryFn: (params: P) => Promise<T>;
  params: P;
  enabled?: boolean;
}

export function useApiList<T, P>({ queryKey, queryFn, params, enabled = true }: UseApiListOptions<T, P>) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    enabled,
  });
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: unknown) => void;
    invalidateKeys?: unknown[][];
  },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      options?.invalidateKeys?.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
