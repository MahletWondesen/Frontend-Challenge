import { useQuery } from '@tanstack/react-query';
import { TeamResponse } from '../types/attendance';

export const useAttendance = () => {
  return useQuery<TeamResponse>({
    queryKey: ['attendance'],
    queryFn: async () => {
      const res = await fetch('https://teamcheckout.com/api/teams/42');
      if (!res.ok) throw new Error('Failed to fetch attendance data');
      return res.json();
    },
  });
};
