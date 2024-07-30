import { AuthUserType } from "@/Types/Auth";
import {
  AppMetaDataInterface,
  MediaItemInterface
} from "@/Types/Module";
import { auth } from "@/firebase-config";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect } from "react";
import { notify } from "../notify";
import {
  queryAppMetaData,
  queryToFetchUserMetaData,
  queryToGetAssetFile,
  queryToGetQuiz,
  queryUserMedia,
} from "./Query";

export const useAuthUser = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      // for syncing all query data if auth user is changed
      if (user?.uid) {
        queryToFetchUserMetaData(user.uid).then((metadata) => {
          queryClient.setQueryData(["auth_user"], {
            ...user,
            ...{ metadata },
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
              queryToFetchUserMetaData(user.uid).then((metadata) => {
                resolve({ ...user, ...{ metadata } });
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

export const useUserMedia = (user_uid?: string) => {
  const queryClient = useQueryClient();
  const user = user_uid || auth.currentUser?.uid;
  const snapshotListener = useCallback((data: any) => {
    queryClient.setQueryData(["user_media", user], data);
    return data;
  }, []);
  return useQuery({
    queryKey: ["user_media", user],
    queryFn: (): Promise<MediaItemInterface[]> =>
      queryUserMedia(snapshotListener, user),
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
    queryFn: (): Promise<AppMetaDataInterface> =>
      queryAppMetaData(snapshotListener),
    placeholderData: keepPreviousData,
  });
};

export const useMediaFile = (key: any) => {
  const queryClient = useQueryClient();
  const snapshotListener = useCallback(
    (data: any) => {
      return queryClient.setQueryData(["asset_file", key], data);
    },
    [queryClient, key]
  );
  return useQuery({
    queryKey: ["asset_file", key],
    queryFn: (): Promise<any> =>
      queryToGetAssetFile(key, snapshotListener).catch((error: any) => {
        let ErrorText;
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            ErrorText = "No object exists at the desired reference.";
            break;
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            ErrorText =
              "User is not authorized to perform the desired action, check your security rules to ensure they are correct.";
            break;
          case "storage/quota-exceeded":
            ErrorText =
              "Quota on your Cloud Storage bucket has been exceeded. If you're on the no-cost tier, upgrade to a paid plan. If you're on a paid plan, reach out to Firebase support.";
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect the server response
            ErrorText = "Unknow error when accessing storage";
            break;
          default:
            ErrorText = "There was a problem with the storage. ";
            break;
        }
        notify.error(
          {
            text: ErrorText,
          },
          error
        );
      }),
    placeholderData: typeof key === "object" ? [] : "",
  });
};

export const useBlob = (key: any, size: number = 300) => {
  return useQuery({
    queryKey: ["blob", key, size],
    queryFn: (): Promise<string> =>
      new Promise((resolve, reject) => {
        try {
          async function fetchBlob(url: any) {
            const response = await fetch(url);
            if (!response.ok) {
              reject("Network response was not ok");
            }
            const blob = await response.blob();
            return blob;
          }

          const resizeFile = (file: any) =>
            new Promise((resolve) => {
              fetchBlob(file)
                .then((file) => {
                  resolve(file);
                })
                .catch(reject);
            });
          resolve(resizeFile(key) as any);
        } catch (error) {
          reject(error);
        }
      }),
  });
};

export const useQuiz = <T>(id?: any, status?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["quiz", id || "all", status];
  const snapshotListener = useCallback((data: any) => {
    queryClient.setQueryData(queryKey, data);
    return data;
  }, [status, id]);
  return useQuery({
    queryKey,
    queryFn: (): Promise<T> => queryToGetQuiz(snapshotListener, id, status),
  });
};
