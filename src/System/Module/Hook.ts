import { AuthUserType } from "@/Types/Auth";
import { auth } from "@/firebase-config";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { notify } from "../notify";

export const useAuthUser = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // for syncing all query data if auth user is changed
      queryClient.setQueryData("auth_user", user);
    });
  }, []);
  return useQuery(
    "auth_user",
    (): Promise<AuthUserType> =>
      new Promise((resolve, reject) =>
        onAuthStateChanged(auth, (user) => {
          try {
            if (!user?.uid) {
              // if user is not signed, sign in user anonymously
              signInAnonymously(auth)
                .then((new_user) => {
                  resolve(new_user.user);
                })
                .catch((error) => {
                  notify.error({
                    title: "Error",
                    text: "[Error %gBF]: Authentication instance unmet.<br/> Contact administrator or try to login",
                  }, error);
                  reject(error);
                });
            } else {
              resolve(user);
            }
          } catch (error) {
            reject(error);
          }
        })
      )
  );
};
