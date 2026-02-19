import { useQuery } from "@tanstack/react-query";
import { getUserInfoApi } from '../api'
import type { UserResponse } from '../api/api.types'

interface DelegateOption {
  id: string;
  name: string;
}

export const useDelegateOption = (): DelegateOption[] => {
  const { data } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfoApi,
    select: (data: UserResponse) =>
      (data?.delegateFor ?? []).map((u) => ({
        id: u.hostUserId,
        name: `${u.hostFirstName} ${u.hostLastName}`,
      })),
  });

  return data ?? [];
};

