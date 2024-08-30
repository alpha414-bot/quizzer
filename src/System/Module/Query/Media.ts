import { auth, firestore, storage } from "@/firebase-config";
import {
    createSlug,
    generateRandomFileName,
    getFileExtension,
    isUrl,
    removeFileExtension,
} from "@/System/functions";
import { notify } from "@/System/notify";
import { MediaItemInterface } from "@/Types/Module";
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

/**
 * <read>
 * QUERY TO READ USER MEDIA ASSETS
 *
 * @param listener subscribe to firebase snapshot
 * @param user_uid the id of the authenticated user
 * @returns promise return MediaItemInterface[]
 */
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
            reject(err);
            notify.error(
              {
                text: `System failed to retrieve app. ${JSON.stringify(
                  err
                )}. <br/> Contact Administrator`,
              },
              err
            );
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

/**
 * <create>
 * QUERY TO CREATE NEW FILES IN STORAGE
 *
 * @param files the files array to be uploaded
 * @param directory the parent directory in the bucket to upload the files
 * @param randomFileName if true random filename is used to store the file
 * @param filename manually specified each filenames to be used if needed
 * @returns promise resolve,reject
 */
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
                        reject(err);
                        notify.error(
                          {
                            text: "File has been uploaded successfully, but there was a problem with storing the media to datastore.",
                          },
                          err
                        );
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
                        reject(err);
                        notify.error(
                          {
                            text: "File exists!. There was issue with updating files record.",
                          },
                          err
                        );
                      });
                  }
                });
              })
              .catch((error) => {
                reject(error);
                notify.error(
                  {
                    text: `There was an error while resolving final upload. Please check with firebase/storage.<br/>${JSON.stringify(
                      error
                    )}`,
                  },
                  error
                );
              });
          })
        );
      }

      Promise.all(promises)
        .then(resolve)
        .catch((err) => {
          reject(err);
          notify.error(
            {
              text: `There was a problem while uploading to storage. <br/> ${JSON.stringify(
                err
              )}`,
            },
            err
          );
        });
    } catch (error) {
      reject(error);

      notify.error(
        {
          text: `There was a trycatch error while uploading files. <br/> ${JSON.stringify(
            error
          )}`,
        },
        error
      );
    }
  });

/**
 * <read>
 * QUERY TO READ FILE FROM STORAGE
 *
 * @param path the relative path to fetch the asset
 * @param listener subsribe to firebase snapshot
 * @param dont_search if true, search won't be run in firebase bucket, but the path would be returned directly
 * @returns
 */
export const queryToGetAssetFile = (
  path: any,
  listener: any,
  dont_search: boolean = false
): Promise<string | object> =>
  new Promise((resolve, reject) => {
    if (isUrl(path) || dont_search) {
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
