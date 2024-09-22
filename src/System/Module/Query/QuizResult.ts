import { auth, firestore } from "@/firebase-config";
import { createSlug, hashed, js } from "@/System/functions";
import { notify } from "@/System/notify";
import { AuthUserType } from "@/Types/Auth";
import { QuizDataResult } from "@/Types/Module";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { addDoc, Timestamp } from "firebase/firestore";
import { queryToLogout } from "./Auth";

// query to store quiz result, create certificate, and create user credentials

/**
 * <create>
 * QUERY TO CREATE QUIZ RESULT
 *
 * @param data the result data to be stored into collection
 * @returns
 */
export const queryToAddResult = (data: QuizDataResult) =>
  new Promise((resolve, reject) => {
    try {
      const UsersCollection = collection(firestore, "Users");
      const QuizResultCollection = collection(firestore, "QuizResult");
      const qu = query(UsersCollection, where("email", "==", data.email));
      getDocs(qu).then((UserDocs) => {
        let User: AuthUserType;
        if (UserDocs.docs.length > 0) {
          // user exists
          User = UserDocs.docs[0].data() as AuthUserType;
        } else {
          // user do not exists, create a new user account and then a new doc
          const password = createSlug(data.company_name);
          createUserWithEmailAndPassword(
            auth,
            data.email as string,
            password
          ).then((user) => {
            addDoc(UsersCollection, {
              uid: user.user.uid,
              first_name: data.first_name,
              last_name: data.last_name,
              company_name: data.company_name,
              company_reg: data.company_reg,
              email: data.email,
              role: "user",
              admin: false,
              password: hashed(password),
            })
          });
        }
        addDoc(QuizResultCollection, {
          ...js(data),
          ...{ uid: User?.uid },
          ...{ createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
        })
          .then((resp) => {
            resolve(resp);
            queryToLogout(true);
          })
          .catch((err) => {
            reject(err);
            notify.error(
              { text: "There was an issue while storing quiz result" },
              err
            );
          });
      });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "There was a try/catch error while storing quiz result.",
        },
        error
      );
    }
  });

/**
 * <read>
 * QUERY TO READ QUIZ RESULT(S)
 *
 * @param id the document id of the quiz result to get
 * @param listener subscribing to firestore snapshot
 * @returns passed as argument
 */
export const queryToGetResult = <T>(
  listener = (e: any) => e,
  id?: string
): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      // onSnapshot would be used in frequent mode, so I am handling all the errors in this container
      const SNAPSHOT_ERROR_HANDLE = (err: any, reject: any) => {
        reject(err);
        notify.error(
          {
            text: "There was an issue while fetching quiz result.",
          },
          err
        );
      };
      let QuizResult = collection(firestore, "QuizResult");
      if (id) {
        const QuizResultDoc = doc(QuizResult, id);
        onSnapshot(
          QuizResultDoc,
          async (snap) => {
            resolve(listener({ ...snap.data(), ...{ id: snap.id } }));
          },
          (err) => SNAPSHOT_ERROR_HANDLE(err, reject)
        );
      } else {
        onSnapshot(
          QuizResult,
          async (snap) => {
            resolve(
              listener(
                snap.docs.map((item) => ({
                  ...item.data(),
                  ...{ id: item.id },
                }))
              )
            );
          },
          (err) => SNAPSHOT_ERROR_HANDLE(err, reject)
        );
      }
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "There was a try/catch error when fetching quiz result",
        },
        error
      );
    }
  });
