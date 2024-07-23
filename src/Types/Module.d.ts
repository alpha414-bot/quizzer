import { FullMetadata } from "firebase/storage";

interface MediaItemInterface {
  id?: string;
  user_uid?: string;
  media: FullMetadata;
  createdAt: Date;
}
