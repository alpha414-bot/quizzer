import { firestore } from "@/firebase-config";
import { generateRandomString, js } from "@/System/functions";
import { notify } from "@/System/notify";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import _ from "lodash";

/**
 * <create>
 * QUERY TO CREATE QUESTION TO QUIZ COLLECTION
 *
 * @param quiz_id the document id of the quiz to add question to
 * @returns
 */
export const queryToAddQuestion = (quiz_id?: any) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const TargetQuizDoc = doc(QuizCollection, quiz_id);
      const QuestionsCollection = collection(TargetQuizDoc, "questions");
      runTransaction(firestore, async (transact) => {
        transact.update(TargetQuizDoc, {
          updatedAt: Timestamp.now(),
        });
        const options = [
          { key: generateRandomString(32), value: "Option 1" },
          { key: generateRandomString(32), value: "Option 2" },
        ];
        transact.set(
          doc(QuestionsCollection, generateRandomString(_.random(18, 22))),
          {
            question: "Enter your question here",
            options: options,
            questionType: "dropdown",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            score: 5,
            invisible: false,
            answer: options[0].key,
          },
          { merge: true }
        );
      })
        .then((resp) => {
          resolve(resp);
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

/**
 * <read>
 * QUERY TO READ QUESTION FROM QUIZ
 *
 * @param listener subscribing to firestore snapshot
 * @param quiz_id the document id of the quiz to get question from
 * @param id the document id of the question to get
 * @returns the return is passed as argument
 */
export const queryToGetQuestion = <T>(
  listener: any,
  quiz_id: any,
  id: any
): Promise<T> =>
  new Promise((resolve, reject) => {
    const QuestionDoc = doc(
      collection(doc(collection(firestore, "Quiz"), quiz_id), "questions"),
      id
    );
    onSnapshot(
      QuestionDoc,
      async (snap) => {
        resolve(listener({ ...snap.data(), ...{ id: snap.id } }));
      },
      (err) => {
        reject(err);
        notify.error(
          { text: "There was an error while retrieving quiz question" },
          err
        );
      }
    );
  });

/**
 * <update>
 * QUERY TO UPDATE QUESTION
 *
 * @param quiz_id the document id of the quiz to update question
 * @param id the document id of the question
 * @param data the question data to add to
 * @returns promise resolve/reject
 */
export const queryToUpdateQuestion = (quiz_id: any, id: any, data: any) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const QuestionDoc = doc(
        collection(doc(QuizCollection, quiz_id), "questions"),
        id
      );
      updateDoc(QuestionDoc, { ...js(data), ...{ updatedAt: Timestamp.now() } })
        .then(resolve)
        .catch((err) => {
          reject(err);
          notify.error(
            { text: "There was an error when question was been updated." },
            err
          );
        });
    } catch (error) {
      reject(error);
      notify.error({ text: "There was an issue while updating question" });
    }
  });

/**
 *
 * @param quiz_id the document id of the quiz to delete question from
 * @param id the document id of the question
 * @returns promise resolve, reject
 */
export const queryToDeleteQuestion = (quiz_id: any, id: any) =>
  new Promise((resolve, reject) => {
    try {
      const QuizCollection = collection(firestore, "Quiz");
      const QuizDoc = doc(QuizCollection, quiz_id);
      runTransaction(firestore, async (transact) => {
        transact.update(QuizDoc, {
          updatedAt: Timestamp.now(),
        });
        transact.delete(doc(collection(QuizDoc, "questions"), id));
      })
        .then((resp) => {
          resolve(resp);
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
