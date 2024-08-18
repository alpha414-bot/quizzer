import { Timestamp } from "firebase/firestore";
import { FullMetadata } from "firebase/storage";
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

type QuizOptionType = { key: string; value: string; unique?: string };

interface QuizQuestionsInterface {
  id: string;
  question: string;
  question_type: "dropdown" | "radio" | "signature";
  score: number;
  options: QuizOptionType[];
  answer: string;
  question_required?: boolean;
}

interface QuizMetaDataInterface {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  image?: MediaItemInterface;
  procedure?: string;
  status?: QuizStateType;
  average_minutes?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface QuizDataInterface extends QuizMetaDataInterface {
  questions: QuizQuestionsInterface[];
}
