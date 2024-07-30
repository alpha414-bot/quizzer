import { Timestamp } from "firebase/firestore";
import { FullMetadata } from "firebase/storage";
import { extend } from "lodash";
interface MediaItemInterface {
  id?: string;
  user_uid?: string;
  media: FullMetadata;
  createdAt: Timestamp;
  reuploadAttempt?: number;
  updatedAt: Timestamp;
}

interface AppMetaDataInterface {
  id?: string;
  logo?: MediaItemInterface;
  favicon?: MediaItemInterface;
  name?: string;
  description?: string;
  system_email?: string;
  fetchedOn?: Timestamp;
}

type QuizStateType = "active" | "draft" | "archive";

interface QuizMetaDataInterface {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  image?: MediaItemInterface;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status?: QuizStateType;
  average_minutes?: number
}

interface QuizQuestionsInterface {
  id: string;
  question: string;
  question_type: // | "multiselect_dropdown"
  // | "boolean"
  | "dropdown"
    | "radio"
    // | "single_line_text"
    // | "long_text"
    // | "checkbox"
    | "signature";
  score: number;
  options: { key?: string; value: string }[];
  correctOption: number;
  question_required?: boolean;
  control?: Control;
}

interface QuizDataInterface extends QuizMetaDataInterface {
  questions: QuizQuestionsInterface[];
}
