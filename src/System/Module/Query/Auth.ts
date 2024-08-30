import { auth, firestore } from "@/firebase-config";
import { AuthErrorFilter } from "@/System/functions";
import { notify } from "@/System/notify";
import { UserMetaDataInterface } from "@/Types/Auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

/**
 * <read>
 * QUERY TO READ USER DATA
 *
 * @param user_uid the id of the authenticated user
 * @returns promise returns UserMetaDataInterface
 */
export const queryToGetUserData = (
  user_uid: any
): Promise<UserMetaDataInterface> =>
  new Promise((resolve, reject) => {
    try {
      const UserCollectionQuery = query(
        collection(firestore, "Users"),
        where("uid", "==", user_uid),
        limit(1)
      );
      getDocs(UserCollectionQuery)
        .then((user_firestore) => {
          if (user_firestore.docs.length > 0) {
            resolve(user_firestore.docs[0].data() as UserMetaDataInterface);
          }
        })
        .catch((err) => {
          reject(err);
          notify.error({
            text: "There was issue while fetching user metadata. Please contact administrator",
          });
        });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "There was a try/catch error when fetching user metadata",
        },
        error
      );
    }
  });

/**
 * QUERY TO REGISTER USER
 *
 * @param payload contains the user registration data
 * @param admin if true, the user is an administrator
 * @returns promise resolve,reject
 */
export const queryToRegister = (
  payload: { email: string; password: string },
  admin: boolean
) =>
  new Promise((resolve, reject) => {
    try {
      createUserWithEmailAndPassword(auth, payload.email, payload.password)
        .then((user) => {
          // Signed up
          const UserCollection = collection(firestore, "Users");
          const { user: currentUser } = user;
          addDoc(UserCollection, {
            role: admin ? "admin" : "user",
            admin: admin,
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            ...payload,
          })
            .then((res) => {
              resolve(res);
              notify.success({
                text: "User has been registered successfully.",
              });
            })
            .catch((err) => {
              reject(err);
              notify.error(
                {
                  text: "There was a problem with registering. Please contact administrator.",
                },
                err
              );
            });
        })
        .catch((error) => {
          reject(error);
          notify.error({ text: AuthErrorFilter(error) });
        });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "There was a try/catch error when registering user.<br/> Please contact administrator.",
        },
        error
      );
    }
  });

/**
 * QUERY TO LOGIN TO ACCOUNT
 *
 * @param payload the user credential
 * @returns promise resolve,reject
 */
export const queryToLogin = (payload: GeneralLoginInterface) =>
  new Promise((resolve, reject) => {
    try {
      signInWithEmailAndPassword(
        auth,
        payload.user as string,
        payload.password as string
      )
        .then((data) => {
          queryToGetUserData(data.user.uid)
            .then((metadata) => {
              const User = { ...data.user, ...{ metadata } };
              resolve(User);
            })
            .catch((err) => {
              reject(err);
              notify.error({
                text: "There was issue while fetching user metadata. Please contact administrator",
              });
            });
        })
        .catch((error) => {
          reject(error);
          notify.error({ text: AuthErrorFilter(error) });
        });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: `[Error #kan]: try/catch: ${JSON.stringify(
            error
          )}. <br/>Contact administrator.`,
        },
        error
      );
    }
  });

/**
 * QUERY TO LOGOUT FROM ACCOUNT.
 *
 * @param dontinform if true, there won't be a notification display for the user
 * @returns promise resolve,reject
 */
export const queryToLogout = (dontinform: boolean = false) =>
  new Promise((resolve, reject) => {
    try {
      signOut(auth)
        .then((res) => {
          if (!dontinform) {
            notify.success({ text: "You have successfully being logged out." });
          }
          resolve(res);
        })
        .catch((error) => {
          reject(error);
          notify.error({
            text: `[Error @llg]: There was a problem with logging you out. <br/>${JSON.stringify(
              error
            )} <br/> Contact administrator`,
          });
        });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: `[Error #kan]: try/catch: ${JSON.stringify(
            error
          )}. <br/>Contact administrator.`,
        },
        error
      );
    }
  });
