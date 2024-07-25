import { auth, firestore, storage } from "@/firebase-config";
import { AppMetaDataInterface, MediaItemInterface } from "@/Types/Module";
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
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
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
  removeFileExtension
} from "../functions";
import { notify } from "../notify";

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
          const AppMetaDocs = {
            ...snap.data(),
            ...{ id: snap.id, fetchedOn: new Date() },
          };
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
                      createdAt: new Date(),
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
                      updatedAt: new Date(),
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
    } else {
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
          console.log("getAssetFile", error);
          reject(error);
        });
    }
  });
