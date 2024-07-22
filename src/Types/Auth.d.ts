import { ParsedToken, User } from "firebase/auth";

interface ClaimsInterface extends ParsedToken {
  admin?: boolean;
  role?: "admin" | "user";
}

interface NewAuthUser extends User {
  claims?: ClaimsInterface;
}

type AuthUserType = NewAuthUser | null | undefined;
