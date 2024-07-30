import { ParsedToken, User } from "firebase/auth";
import { AppMetaDataInterface } from "./Module";

interface ClaimsInterface extends ParsedToken {
  admin?: boolean;
  role?: "admin" | "user";
}
interface UserMetaDataInterface {
  admin: boolean;
  role: "admin" | "user" | "guet";
  displayName?: string;
  uid: string;
}

interface NewAuthUser extends User {
  claims?: ClaimsInterface;
  metadata?: UserMetaDataInterface | null;
  app?: AppMetaDataInterface;
}

type AuthUserType = NewAuthUser | null | undefined;
