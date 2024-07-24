import { ParsedToken, User } from "firebase/auth";

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
}

type AuthUserType = NewAuthUser | null | undefined;
