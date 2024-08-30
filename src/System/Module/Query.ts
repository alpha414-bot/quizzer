import { firestore } from "@/firebase-config";
import { AppMetaDataInterface } from "@/Types/Module";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { notify } from "../notify";

/**
 * <read>
 * QUERY TO READ APP METADATA
 *
 * @param listener subscribe to firebase snapshot
 * @returns promise returns AppMetaDataInterface
 */
export const queryAppMetaData = (
  listener: any
): Promise<AppMetaDataInterface> =>
  new Promise((resolve, reject) => {
    try {
      const AppMetaDataCollection = collection(firestore, "App");
      const AppMetaDataDoc = doc(AppMetaDataCollection, "metadata");

      onSnapshot(
        AppMetaDataDoc,
        async (snap) => {
          let AppMetaDocs: AppMetaDataInterface | null = null;
          if (snap.data()) {
            AppMetaDocs = {
              ...snap.data(),
              ...{ id: snap.id, fetchedOn: Timestamp.now() },
            };
          }
          resolve(listener(AppMetaDocs));
        },
        (err) => {
          reject(err);
          notify.error(
            {
              text: `System failed to fetch app. ${JSON.stringify(
                err
              )}. <br/> Contact Administrator`,
            },
            err
          );
        }
      );
    } catch (error) {
      reject(error);
      notify.error(
        { text: "There was a problem with retrieving app metadata." },
        error
      );
    }
  });

/**
 * <update>
 * QUERY TO UPDATE USER METADATA
 *
 * @param data the app metadata to be updated to
 * @returns promise resolve,reject
 */
export const queryToStoreAppMetaData = (data: AppMetaDataInterface) =>
  new Promise((resolve, reject) => {
    try {
      const AppCollection = collection(firestore, "App");
      const MetadataDoc = doc(AppCollection, "metadata");
      setDoc(MetadataDoc, {
        ...data,
      })
        .then((resp) => {
          resolve(resp);
          notify.success({
            text: "App metadata has been successfully updated.",
          });
        })
        .catch((err) => {
          reject(err);
          notify.error(
            { text: "System met with issue while storing app metadata." },
            err
          );
        });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "Try/catch caught while storing app metadata.",
        },
        error
      );
    }
  });
