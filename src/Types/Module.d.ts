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
  logo?: MediaItemInterface;
  name?: string;
  description?: string;
  system_email?: string;
}