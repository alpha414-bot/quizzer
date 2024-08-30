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
  invisible: boolean;
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

interface QuizDataResult {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company_name?: string;
  company_reg?: string;
  quiz_id?: string;
  right_answer?: {
    question?: QuizQuestionsInterface;
    answer: string;
    score: number;
  }[];
  wrong_answer?: {
    question?: QuizQuestionsInterface;
    answer: string;
    score: number;
  }[];
  right_score: number;
  wrong_score: number;
  total_score: number;
  passed: boolean;
  percent: string;
  certificate?: any;
}

type DeliverType = {
  state: "PENDING" | "RETRY" | "PROCESSING" | "SUCCESS" | "ERROR";
  startTime: Date;
  endTime?: Date;
  deliveryResponse?: {
    accepted?: string[];
    rejected?: string[];
    ehlo?: string[];
    envelopeTime?: number;
    messageTime?: number;
    messageSize?: number;
    response?: string;
    envelope?: {
      from: string;
      to: string[];
    };
    messageId?: string;
    code?: string;
    responseCode?: number;
    command?: string;
  };
  attempts?: number;
  leaseExpireTime?: Date;
};

interface MailDataInterface {
  to: string;
  reply_to?: string;
  app_name?: string;
  subject: string;
  message: string;
  delivery?: DeliverType;
}
