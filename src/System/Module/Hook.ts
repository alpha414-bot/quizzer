import { AuthUserType } from "@/Types/Auth";
import { auth } from "@/firebase-config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect } from "react";
import { queryAppMetaData } from "./Query";

export const useAuthUser = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // for syncing all query data if auth user is changed
      if (user?.uid) {
        auth.currentUser?.getIdTokenResult(true).then((token_result) => {
          queryClient.setQueryData(["auth_user"], {
            ...user,
            ...{ claims: token_result.claims },
          });
        });
      } else {
        queryClient.setQueryData(["auth_user"], null);
      }
    });
  }, []);
  return useQuery({
    queryKey: ["auth_user"],

    queryFn: (): Promise<AuthUserType> =>
      new Promise((resolve, reject) =>
        onAuthStateChanged(auth, (user) => {
          try {
            if (user?.uid) {
              // if user is not signed, sign in user anonymously
              auth.currentUser?.getIdTokenResult(true).then((token_result) => {
                resolve({ ...user, ...{ claims: token_result.claims } });
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        })
      ),
  });
};

export const useApp = () => {
  const queryClient = useQueryClient();
  const snapshotListener = useCallback((data: any) => {
    queryClient.setQueryData(["app", "metadata"], data);
    return data;
  }, []);
  return useQuery({
    queryKey: ["app", "metadata"],
    queryFn: () => queryAppMetaData(snapshotListener),
  });
};
