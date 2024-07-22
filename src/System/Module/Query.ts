import { auth, firestore } from "@/firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import _ from "lodash";
import moment from "moment";
import { AuthErrorFilter } from "../functions";
import { notify } from "../notify";

// login user/admin to their accounts
export const queryToLogin = (
  payload: GeneralLoginInterface,
  options: { type: "admin" | "user" }
) =>
  new Promise((resolve, reject) => {
    try {
      signInWithEmailAndPassword(
        auth,
        payload.user as string,
        payload.password as string
      )
        .then((data) => {
          data.user.getIdTokenResult(true).then((token) => {
            const claims = token.claims;
            if (claims.role === options.type) {
              resolve(data);
              notify.success({
                text: `Welcome <i>${
                  data?.user?.displayName
                    ? _.startCase(data?.user?.displayName)
                    : ""
                }</i> to your <strong>${_.startCase(
                  claims.role + " Dashboard"
                )}</strong>.`,
              });
            } else {
              notify.error({
                text: "You are accessing the wrong resources, please navigate to the right user directory/page before login",
              });
              logout(true);
            }
          });
        })
        .catch((error) => {
          notify.error({ text: AuthErrorFilter(error) });
          reject(error);
        });
    } catch (error) {
      notify.error(
        {
          text: `[Error #kan]: try/catch: ${JSON.stringify(
            error
          )}. <br/>Contact administrator.`,
        },
        error
      );
      reject(error);
    }
  });

// logout user from account
export const logout = (dontinform: boolean = false) =>
  new Promise((resolve, reject) => {
    try {
      signOut(auth)
        .then((res) => {
          notify.success({ text: "You have successfully being logged out." });
          resolve(res);
        })
        .catch((error) => {
          if (!dontinform) {
            notify.error({
              text: `[Error @llg]: There was a problem with logging you out. <br/>${JSON.stringify(
                error
              )} <br/> Contact administrator`,
            });
          }
          reject(error);
        });
    } catch (error) {
      notify.error(
        {
          text: `[Error #kan]: try/catch: ${JSON.stringify(
            error
          )}. <br/>Contact administrator.`,
        },
        error
      );
      reject(error);
    }
  });

// fetch app metadata
export const queryAppMetaData = (listener: any) =>
  new Promise((resolve, reject) => {
    try {
      const AppMetaDataCollection = query(
        collection(firestore, "App"),
        orderBy("name", "asc")
      );
      onSnapshot(
        AppMetaDataCollection,
        async (snap) => {
          const AppMetaDocs = snap.docs.map((item) => ({
            ...item.data(),
            ...{ id: item.id, fetchedOn: moment() },
          }));
          resolve(listener(AppMetaDocs));
        },
        (err) => {
          notify.error({
            text: `System failed to fetch app. ${JSON.stringify(
              err
            )}. <br/> Contact Administrator`,
          });
          reject(err);
        }
      );
    } catch (error) {
      notify.error(
        { text: "There was a problem with retrieving app metadata." },
        error
      );
      reject(error);
    }
  });
