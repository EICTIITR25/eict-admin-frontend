import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import api from "../services/api";
import { useMemo } from "react";

export const useCrud = <T = any>() => {
  const queryClient = useQueryClient();

  const useFetch = <R = T>(
    url = "",
    params: Record<string, any> = {},
    options: Partial<UseQueryOptions<R, Error>> = {}
  ) => {
    const queryKey = useMemo(
      () =>
        [
          url,
          Object.keys(params).length > 0 ? JSON.stringify(params) : null,
        ].filter(Boolean),
      [url, params]
    );

    return useQuery<R, Error>({
      queryKey,
      queryFn: async () => {
        const res = await api.get<R>(
          `${process.env.REACT_APP_API_BASE_URL}${url}`,
          { params }
        );
        return res.data;
      },
      enabled: !!url,
      ...options,
    });
  };

  const useCreate = (
    url = "",
    invalidateQueryKey?: string | string[],
    options: Partial<UseMutationOptions<T, Error, Partial<T> | FormData>> = {}
  ) => {
    // Extract callbacks from options to handle them separately
    const {
      onSuccess: userOnSuccess,
      onError: userOnError,
      onSettled: userOnSettled,
      ...restOptions
    } = options;
    // console.log('invalidateQueryKey :', invalidateQueryKey);

    return useMutation({
      mutationFn: async (data: Partial<T> | FormData) => {
        const isFormData = data instanceof FormData;
        const res = await api.post<T>(
          `${process.env.REACT_APP_API_BASE_URL}${url}`,
          data,
          {
            headers: isFormData
              ? { "Content-Type": "multipart/form-data" }
              : { "Content-Type": "application/json" },
          }
        );
        return res.data;
      },
      onSuccess: (data, variables, context) => {
        // Handle query invalidation FIRST
        if (invalidateQueryKey) {
          if (Array.isArray(invalidateQueryKey)) {
            invalidateQueryKey.forEach((key) => {
              if (Array.isArray(key)) {
                queryClient.invalidateQueries({ queryKey: key });
              } else {
                queryClient.invalidateQueries({ queryKey: [key] });
              }
            });
          } else {
            queryClient.invalidateQueries({ queryKey: [invalidateQueryKey] });
          }
        }

        // THEN call user-provided onSuccess callback
        if (userOnSuccess) {
          userOnSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context) => {
        // Call user-provided onError callback
        if (userOnError) {
          userOnError(error, variables, context);
        }
      },
      onSettled: (data, error, variables, context) => {
        // Call user-provided onSettled callback
        if (userOnSettled) {
          userOnSettled(data, error, variables, context);
        }
      },
      ...restOptions, // Spread the rest of the options (excluding callbacks)
    });
  };

  const useUpdate = <U = T>(
    url = "",
    invalidateQueryKey?: string | string[],
    options: Partial<
      UseMutationOptions<
        U,
        Error,
        {
          id?: string | number;
          data?: Partial<U> | FormData;
          body?: Record<string, any>;
        }
      >
    > = {}
  ) => {
    const {
      onSuccess: userOnSuccess,
      onError: userOnError,
      onSettled: userOnSettled,
      ...restOptions
    } = options;

    return useMutation({
      mutationFn: async ({
        id,
        data,
        body = {},
      }: {
        id?: string | number;
        data?: Partial<U> | FormData;
        body?: Record<string, any>;
      }) => {
        const isFormData = data instanceof FormData;
        let requestData: any = data || {};

        // Merge body if data is not FormData and body exists
        if (!isFormData && body && Object.keys(body).length > 0) {
          requestData = { ...requestData, ...body };
        }

        const requestUrl = `${process.env.REACT_APP_API_BASE_URL}${url}${
          id ? `${id}/` : ""
        }`;

        const res = await api.put<U>(requestUrl, requestData, {
          headers: isFormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
        });

        return res.data;
      },
      onSuccess: (data, variables, context) => {
        if (invalidateQueryKey) {
          const keys = Array.isArray(invalidateQueryKey)
            ? invalidateQueryKey
            : [invalidateQueryKey];
          keys.forEach((key) =>
            queryClient.invalidateQueries({
              queryKey: Array.isArray(key) ? key : [key],
            })
          );
        }
        userOnSuccess?.(data, variables, context);
      },
      onError: userOnError,
      onSettled: userOnSettled,
      ...restOptions,
    });
  };

  const useDelete = (
    url = "",
    invalidateQueryKey?: string | string[],
    options: Partial<
      UseMutationOptions<
        T,
        Error,
        {
          id?: string | number;
          body?: Record<string, any>;
        }
      >
    > = {}
  ) => {
    const {
      onSuccess: userOnSuccess,
      onError: userOnError,
      onSettled: userOnSettled,
      ...restOptions
    } = options;

    return useMutation({
      mutationFn: async ({
        id,
        body = {},
      }: {
        id?: string | number;
        body?: Record<string, any>;
      }) => {
        const requestUrl = `${process.env.REACT_APP_API_BASE_URL}${url}${
          id ? `${id}/` : ""
        }`;

        const res = await api.delete<T>(requestUrl, {
          data: body,
        });

        return res.data;
      },
      onSuccess: (data, variables, context) => {
        if (invalidateQueryKey) {
          const keys = Array.isArray(invalidateQueryKey)
            ? invalidateQueryKey
            : [invalidateQueryKey];
          keys.forEach((key) =>
            queryClient.invalidateQueries({
              queryKey: Array.isArray(key) ? key : [key],
            })
          );
        }
        userOnSuccess?.(data, variables, context);
      },
      onError: userOnError,
      onSettled: userOnSettled,
      ...restOptions,
    });
  };

  return { useFetch, useCreate, useUpdate, useDelete };
};
