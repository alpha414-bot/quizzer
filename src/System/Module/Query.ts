import { auth, firestore, storage } from "@/firebase-config";
import {
  AppMetaDataInterface,
  MediaItemInterface,
  QuizDataInterface,
  QuizMetaDataInterface,
} from "@/Types/Module";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import _ from "lodash";
// import * as sharp from 'sharp-wasm';
import { UserMetaDataInterface } from "@/Types/Auth";
import {
  AuthErrorFilter,
  createSlug,
  generateRandomFileName,
  getFileExtension,
  isURL,
  js,
  removeFileExtension,
} from "../functions";
import { notify } from "../notify";

const retrieveQuestionData = (ref: DocumentReference) =>
  new Promise((resolve, reject) => {
    const QuestionsCollection = collection(ref, "questions");
    onSnapshot(
      QuestionsCollection,
      async (snapQuestion) => {
        const questionData = snapQuestion.docs.map((item) => ({
          ...item.data(),
          ...{ id: item.id },
        }));
        resolve(questionData);
      },
      (err) => {
        reject(err);
        notify.error(
          {
            text: "There was a problem with fetching each quiz question",
          },
          err
        );
      }
    );
  });

// query to store metadata of surveys
export const queryToStoreQuizMetaData = (data: QuizMetaDataInterface) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const q = query(QuizCollection, where("slug", "==", data.slug));
      getDocs(q).then((snap) => {
        if (snap.empty && snap.size == 0) {
          addDoc(QuizCollection, {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          })
            .then((resp) => {
              resolve({ ...{ id: resp.id }, ...data });
            })
            .catch((err) => {
              notify.error(
                {
                  text: "There was an issue while adding quiz metadata.",
                },
                err
              );
            });
        } else {
          resolve({ ...snap.docs[0].data(), ...{ error: true } });
          notify.info({
            text: `The quiz <strong>${data?.title}</strong> already exists! Please go to quiz list to check that out.`,
          });
        }
      });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "There was a try/catch error when setting up quiz. Please contact administrator",
        },
        error
      );
    }
  });

// query to quiz questions and store data
export const queryToUpdateQuiz = (id: string, data: QuizDataInterface) =>
  new Promise(async (resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const SpecificQuizDoc = doc(QuizCollection, id);
      if (data.questions.length > 0 || data.procedure) {
        runTransaction(firestore, async (transact) => {
          if (data.procedure) {
            transact.update(SpecificQuizDoc, {
              procedure: data.procedure,
              updatedAt: new Date(),
            });
          }
          // go to the doc of each specific questions and update what needs to be updated
          data?.questions?.forEach(async (item) => {
            transact.update(
              doc(collection(SpecificQuizDoc, "questions"), item.id),
              {
                ...js(item),
              }
            );
          });
        })
          .then(resolve)
          .catch((err) => {
            reject(err);
            notify.error(
              {
                text: "The system met with an error while updating quiz",
              },
              err
            );
          });
      }
    } catch (error) {
      reject(error);
      notify.error({ text: "Try/catch error while updating quiz" }, error);
    }
  });

// query to get quiz all data
export const queryToGetQuiz = <T>(
  listener: any,
  id?: any,
  status?: string
): Promise<T> =>
  new Promise((resolve, reject) => {
    let QuizCollection: any = collection(firestore, "Quiz");
    if (id) {
      // retrieving one quiz
      const MediaDoc = doc(QuizCollection, id);
      onSnapshot(
        MediaDoc,
        async (snap) => {
          // retrieve the questions collection under this quiz
          const QuestionsCollection = query(
            collection(snap.ref, "questions"),
            orderBy("createdAt")
          );
          // query should be fetched randomly (to be added later)
          onSnapshot(
            QuestionsCollection,
            async (snapQuestion) => {
              const questionData = snapQuestion.docs.map((item) => ({
                ...item.data(),
                ...{ id: item.id },
              }));
              const data = {
                ...snap.data(),
                ...{ id: snap.id, questions: questionData },
              };
              resolve(listener(data));
            },
            (err) => {
              reject(err);
              notify.error({
                text: "There was a problem while fetching quiz question",
              });
            }
          );
        },
        (err) => {
          reject(err);
          notify.error({
            text: "There was an issue while retrieving quiz data",
          });
        }
      );
    } else {
      // retrieving all quizes
      if (status && status != "all") {
        QuizCollection = query(QuizCollection, where("status", "==", status));
      }
      onSnapshot(
        QuizCollection,
        async (snap: any) => {
          const data = snap.docs.map(async (item: any) => {
            const questions = await retrieveQuestionData(item.ref);
            return {
              ...item.data(),
              ...{
                id: item.id,
                questions,
              },
            };
          });
          Promise.all(data).then((data: any) => {
            resolve(listener(data));
          });
        },
        (err) => {
          reject(err);
          notify.error(
            { text: "There was an issue while retrieving quiz data" },
            err
          );
        }
      );
    }
  });

// query to delete quiz
export const queryToDeleteQuiz = (id?: any) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const QuizDocRef = doc(QuizCollection, id);
      deleteDoc(QuizDocRef)
        .then((resp) => {
          resolve(resp);
          notify.success({ text: "Quiz has been successfully deleted." });
        })
        .catch((err) => {
          reject(err);
          notify.error({ text: "There was an error while deleting quiz" }, err);
        });
    } catch (error) {
      reject(error);
      notify.error({ text: "try/catch error while deleting quiz" }, error);
    }
  });
// query to add question
export const queryToAddQuizQuestion = (quiz_id?: any) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const TargetQuizDoc = doc(QuizCollection, quiz_id);
      const QuestionsCollection = collection(TargetQuizDoc, "questions");
      addDoc(QuestionsCollection, {
        question: "Enter your question here",
        options: [
          { key: "option-1", value: "Option 1" },
          { key: "option-2", value: "Option-2" },
        ],
        questionType: "dropdown",
        createdAt: new Date(),
        updatedAt: new Date(),
        score: 0,
        answer: { key: "option-1", value: "Option 1" },
      })
        .then((resp) => {
          resolve(resp);
          notify.success({ text: "Question has been added successfully" });
        })
        .catch((err) => {
          reject(err);
          notify.error(
            { text: "There was an issue while adding question" },
            err
          );
        });
    } catch (error) {
      reject(error);
      notify.error({
        text: "There was error while adding question to quiz",
      });
    }
  });

// query to delete question
export const queryToDeleteQuizQuestion = (quiz_id: any, id: any) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const SpecificQuestionDoc = doc(
        collection(doc(QuizCollection, quiz_id), "questions"),
        id
      );
      deleteDoc(SpecificQuestionDoc)
        .then((resp) => {
          resolve(resp);
          notify.success({
            text: "The question has been successfully deleted",
          });
        })
        .catch((err) => {
          reject(err);
          notify.error({
            text: "There was an error while delete question docs",
          });
        });
    } catch (error) {
      reject(error);
      notify.error({
        text: "There was error while adding a new question to quiz",
      });
    }
  });

// fetch user metadata
export const queryToFetchUserMetaData = (
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
          resolve(user_firestore.docs[0].data() as UserMetaDataInterface);
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
          queryToFetchUserMetaData(data.user.uid)
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
          if (false) {
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
          }
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

// register user to their accounts
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

// logout user from account
export const logout = (dontinform: boolean = false) =>
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
          notify.error({
            text: `[Error @llg]: There was a problem with logging you out. <br/>${JSON.stringify(
              error
            )} <br/> Contact administrator`,
          });
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
          notify.error(
            {
              text: `System failed to fetch app. ${JSON.stringify(
                err
              )}. <br/> Contact Administrator`,
            },
            err
          );
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

// store app metadata
export const queryToStoreAppMetaData = (data: AppMetaDataInterface) =>
  new Promise((resolve, reject) => {
    try {
      const AppCollection = collection(firestore, "App");
      const MetadataDoc = doc(AppCollection, "metadata");
      setDoc(MetadataDoc, {
        ...data,
        // ...{ logo: data.logo?.media.fullPath },
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

// fetch user media
export const queryUserMedia = (
  listener: any,
  user_uid?: string
): Promise<MediaItemInterface[]> =>
  new Promise((resolve, reject) => {
    try {
      if (user_uid) {
        const MediaCollection = query(
          collection(firestore, "Media"),
          where("user_uid", "==", user_uid),
          orderBy("createdAt", "desc")
        );
        onSnapshot(
          MediaCollection,
          async (snap) => {
            const MedidaDocs = snap.docs.map((item) => ({
              ...item.data(),
              ...{ id: item.id },
            }));
            resolve(listener(MedidaDocs || []));
          },
          (err) => {
            notify.error(
              {
                text: `System failed to retrieve app. ${JSON.stringify(
                  err
                )}. <br/> Contact Administrator`,
              },
              err
            );
            reject(err);
          }
        );
        return true;
      }
      resolve([]);
      return false;
    } catch (error) {
      notify.error(
        { text: "There was a try/catch error while querying user media" },
        error
      );
    }
  });

// upload files to storage
export const queryToUploadFiles = (
  files: File[],
  directory: string = "/",
  randomFileName: boolean = true, // system should generate random filename for each files
  filename?: string[] // system should make use of specificed filename for each files index in the array
) =>
  new Promise((resolve, reject) => {
    try {
      const promises = [];
      for (let i = 0; i < files?.length; i++) {
        const file = files[i];
        let FileName;
        if (randomFileName) {
          FileName = generateRandomFileName(12);
        } else {
          FileName = removeFileExtension(
            filename && filename?.length > 0
              ? filename[i] // make sure the current index as a specified name being sent in
                ? filename[i]
                : file?.name // if not, use the name of the file uploaded as the filename
              : file?.name
          );
        }
        const FileExtension = getFileExtension(file?.name);
        const FileRef = ref(
          storage,
          directory
            ? `${directory}/${FileName}.${FileExtension}`
            : `${FileName}.${FileExtension}`
        );
        promises.push(
          new Promise((resolve, reject) => {
            uploadBytes(FileRef, file, {
              customMetadata: { mime_type: file.type },
            })
              .then((snapshot) => {
                const slug = createSlug(snapshot.metadata.fullPath);
                const MediaCollection = collection(firestore, "Media");
                const q = query(MediaCollection, where("slug", "==", slug));

                getDocs(q).then((snap) => {
                  if (snap.empty && snap.size == 0) {
                    // prevent duplicate entry of the same file again after upload to storage
                    addDoc(MediaCollection, {
                      user_uid: auth.currentUser?.uid,
                      slug: slug,
                      reuploadAttempt: 1,
                      createdAt: Timestamp.now(),
                      media: JSON.parse(
                        JSON.stringify({ ...snapshot.metadata })
                      ),
                    })
                      .then((data) => {
                        resolve({
                          ...data,
                          ...{ path: snapshot.metadata.fullPath },
                        });
                        notify.success({
                          text:
                            files.length == 1
                              ? "File is uploaded successfully."
                              : "Files are uploaded successfully.",
                        });
                      })
                      .catch((err) => {
                        notify.error(
                          {
                            text: "File has been uploaded successfully, but there was a problem with storing the media to datastore.",
                          },
                          err
                        );
                        reject(err);
                      });
                  } else {
                    // const ReferenceDoc = doc(firestore, snap.docs[0]);
                    const ReferenceDoc = doc(MediaCollection, snap.docs[0].id);
                    updateDoc(ReferenceDoc, {
                      // updatedAt: Timestamp.now(),
                      reuploadAttempt:
                        (snap.docs[0].data().reuploadAttempt || 0) + 1,
                    })
                      .then(() => {
                        resolve({
                          ...{
                            path: snapshot.metadata.fullPath,
                            id: ReferenceDoc.id,
                          },
                        });
                        notify.success({
                          text: "File already exists, Records has been updated successfully.",
                        });
                      })
                      .catch((err) => {
                        notify.error(
                          {
                            text: "File exists!. There was issue with updating files record.",
                          },
                          err
                        );
                        reject(err);
                      });
                  }
                });
              })
              .catch((error) => {
                notify.error(
                  {
                    text: `There was an error while resolving final upload. Please check with firebase/storage.<br/>${JSON.stringify(
                      error
                    )}`,
                  },
                  error
                );
                reject(error);
              });
          })
        );
      }

      Promise.all(promises)
        .then(resolve)
        .catch((err) => {
          notify.error(
            {
              text: `There was a problem while uploading to storage. <br/> ${JSON.stringify(
                err
              )}`,
            },
            err
          );
          reject(err);
        });
    } catch (error) {
      notify.error(
        {
          text: `There was a trycatch error while uploading files. <br/> ${JSON.stringify(
            error
          )}`,
        },
        error
      );
      reject(error);
    }
  });

//
export const queryToDeleteFiles = (path: string) =>
  new Promise((resolve, reject) => {
    try {
      const FileRef = ref(storage, path);
      // delete from firestore collection first, and then proceed to deleting from storage
      const MediaCollection = collection(firestore, "Media");
      const QueryForFile = query(
        MediaCollection,
        where("media.fullPath", "==", path),
        limit(1)
      );
      getDocs(QueryForFile).then((snapFile) => {
        if (!snapFile.empty) {
          const MediaFile = snapFile.docs[0];
          deleteDoc(MediaFile.ref)
            .then(() => {
              // if media docs was deleted from firestore successfully, then there is no point as to if it was deleted in the bucket
              deleteObject(FileRef).then((resp) => {
                resolve(resp);
                notify.success({
                  text: "File has been deleted successfully.",
                });
              });
            })
            .catch((err) => {
              console.log(
                "There was a severe issue while delete file. Please contact administrator",
                err,
                err.code
              );
            });
        }
      });
    } catch (error) {
      reject(error);
      notify.error(
        {
          text: "Try/catch error while deleting the file. Please try again later.",
        },
        error
      );
    }
  });

export const queryToGetAssetFile = (
  path: any,
  listener: any,
  dont_search: boolean = false
): Promise<string | object> =>
  new Promise((resolve, reject) => {
    if (isURL(path) || dont_search) {
      resolve(path);
      return path;
    } else if (!!path) {
      if (typeof path === "object") {
        let ResolvedData: object = {};
        path?.forEach(async (element: any) => {
          try {
            const data = await getDownloadURL(ref(storage, element));
            ResolvedData = _.merge(ResolvedData, {
              [_.replace(element, /[^a-zA-Z0-9]/g, "")]: data,
            });
          } catch (error: any) {
            ResolvedData = _.merge(ResolvedData, {
              [_.replace(element, /[^a-zA-Z0-9]/g, "")]: "",
            });
            reject(listener(ResolvedData));
          }
          if (Object.values(ResolvedData).length === 0) {
            // no path was successfully retrieved
            reject(listener({}));
            return false;
          }
          resolve(listener(ResolvedData));
        });
        return true;
      }
      return getDownloadURL(ref(storage, path))
        .then((url: any) => {
          resolve(url);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
