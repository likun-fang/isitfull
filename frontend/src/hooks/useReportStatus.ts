import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { useAuthStore } from '../stores';
import { ReportRequest, ReportResponse, Rvm, UserRank } from '../types';

interface ReportMutationVariables extends ReportRequest {
  rvmId: number;
}

export interface ReportResult {
  response: ReportResponse;
  leveledUp: boolean;
  previousRank?: UserRank;
  newRank?: UserRank;
  _reported: { rvmId: number; status: ReportRequest['status']; queueLength?: ReportRequest['queueLength'] };
}

export function useReportStatus(rvmId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: ReportMutationVariables | ReportRequest): Promise<ReportResult> => {
      const id = 'rvmId' in variables ? variables.rvmId : rvmId;
      if (!id) throw new Error('rvmId is required');

      const request: ReportRequest = {
        status: variables.status,
        latitude: variables.latitude,
        longitude: variables.longitude,
        queueLength: variables.queueLength,
      };
      const response = await reportService.create(id, request);

      const leveledUp = response.leveledUp === true || response.leveledUp === 'true' as unknown as boolean;

      return {
        response,
        leveledUp,
        previousRank: response.previousRank,
        newRank: response.newRank,
        _reported: { rvmId: id, status: variables.status, queueLength: variables.queueLength },
      };
    },
    onSuccess: (result: ReportResult) => {
      const { rvmId: id, status, queueLength } = result._reported;

      // Optimistic update: patch local cache so the user sees their own
      // change instantly without waiting for the next server refetch.
      const patchRvm = (rvm: Rvm): Rvm =>
        rvm.id === id
          ? { ...rvm, status, queueLength: queueLength ?? rvm.queueLength, statusUpdatedAt: new Date().toISOString() }
          : rvm;

      // Patch nearby lists (queryKey prefix ['rvms', ...])
      queryClient.setQueriesData<Rvm[]>(
        { queryKey: ['rvms'] },
        (old) => old?.map(patchRvm),
      );

      // Patch detail view (queryKey ['rvm', id])
      queryClient.setQueriesData<Rvm>(
        { queryKey: ['rvm', id] },
        (old) => old ? patchRvm(old) : old,
      );

      // Mark stale but don't refetch now — avoids HTTP cache returning
      // old data and overwriting the optimistic value. The next natural
      // trigger (refetchInterval, focus, navigation) will sync.
      queryClient.invalidateQueries({ queryKey: ['rvms'], refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['rvm', id], refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['karmaLogs'] });

      // Optimistic karma: add predicted award to current points.
      // Backend returns totalKarma as null (karma is awarded async after
      // commit), so we use karmaAwarded (predicted delta) instead.
      const currentUser = useAuthStore.getState().user;

      if (currentUser && result.response.karmaAwarded) {
        useAuthStore.getState().setUser({
          ...currentUser,
          karmaPoints: (currentUser.karmaPoints ?? 0) + result.response.karmaAwarded,
          rank: result.newRank ?? currentUser.rank,
        });
      }
    },
  });
}
