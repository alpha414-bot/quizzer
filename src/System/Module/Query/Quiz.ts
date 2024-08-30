import { firestore } from "@/firebase-config";
import { js } from "@/System/functions";
import { notify } from "@/System/notify";
import {
  QuizDataInterface,
  QuizMetaDataInterface,
  QuizQuestionsInterface,
} from "@/Types/Module";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  Timestamp,
  where,
} from "firebase/firestore";
import _ from "lodash";
import { queryToAddQuestion } from "./QuizQuestion";

/**
 * <create>
 * QUERY TO CREATE QUIZ
 *
 * @param data the data of quiz to be stored
 * @returns promise resolve/reject
 */
export const queryToAddQuiz = (data: QuizMetaDataInterface) =>
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
              queryToAddQuestion(resp.id).then(() => {
                resolve({ ...{ id: resp.id }, ...data });
              });
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

/**
 * <read>
 * QUERY TO READ QUIZ(S)
 *
 * @param listener subscribing to firestore snapshot
 * @param id the id of the quiz to get, else if id is null, all data in the collection would be returned
 * @param status the status of the quiz state
 * @returns return is passed as argument
 */
export const queryToGetQuiz = <T>(
  listener: any,
  id?: any,
  status?: string
): Promise<T> =>
  new Promise((resolve, reject) => {
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
    let QuizCollection: any = collection(firestore, "Quiz");
    if (id) {
      // retrieving one quiz
      const MediaDoc = doc(QuizCollection, id);
      onSnapshot(
        MediaDoc,
        async (snap) => {
          // retrieve the questions collection under this quiz
          let QuestionsCollection = query(
            collection(snap.ref, "questions"),
            orderBy("createdAt")
          );

          if (status == "form") {
            // only fetch question that are meant to be visible to users
            QuestionsCollection = query(
              QuestionsCollection,
              where("invisible", "!=", true)
            );
          }
          // query should be fetched randomly (to be added later)
          onSnapshot(
            QuestionsCollection,
            async (snapQuestion) => {
              let questionData = snapQuestion.docs.map((item) => {
                let data = item.data() as QuizQuestionsInterface;
                if (status === "form") {
                  // the quiz is being retrieved from user end, so the options should be shuffled
                  data.options = _.shuffle(data.options);
                }
                return {
                  ...data,
                  ...{ id: item.id },
                };
              });

              if (status == "form") {
                // shuffle question too
                questionData = _.shuffle(questionData);
              }
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
        QuizCollection = query(
          QuizCollection,
          where("status", "==", status),
          orderBy("createdAt", "desc")
        );
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

/**
 * <update>
 * QUERY TO UPDATE QUIZ DATA AND/OR ITS QUESTIONS
 *
 * @param id the document id of the quiz to be updated
 * @param data the new serialize data to be stored.
 * @returns promise resolve/reject
 */
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
            });
          }
          const Snap = await getDocs(collection(SpecificQuizDoc, "questions"));
          Snap?.docs?.forEach(async (doc) => {
            transact.update(doc.ref, {
              ...js(_.find(data.questions, (e) => e.id == doc.id)),
            });
          });
          // go to the doc of each specific questions and update what needs to be updated
          transact.update(SpecificQuizDoc, {
            updatedAt: Timestamp.now(),
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

/**
 * <delete>
 * QUERY TO DELETE QUIZ
 *
 * @param id the document id of the quiz to be deleted
 * @returns boolean true or false
 */
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
