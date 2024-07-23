import Animate from "@/Components/Animate";
import Button from "@/Components/Button";
import Input from "@/Components/Input";
import PageMeta from "@/Layouts/PageMeta";
import { EmailPattern } from "@/System/functions";
import { queryToLogin } from "@/System/Module/Query";
import { SubmitHandler, useForm } from "react-hook-form";

const AdminLogin = () => {
  const { control, handleSubmit } = useForm<GeneralLoginInterface>({
    mode: "all",
  });
  const loginAdministrator: SubmitHandler<GeneralLoginInterface> = (data) =>
    queryToLogin(data, { type: "admin" });

  return (
    <PageMeta title="Dashboard - Login">
      <div className="min-h-screen flex items-center justify-center px-4 md:px-12">
        <form
          className="my-12 space-y-7 w-full border-2 py-12 px-8 rounded-lg lg:w-3/6 md:space-y-4"
          onSubmit={handleSubmit(loginAdministrator)}
        >
          <div className="text-center">
            <Animate
              content={
                <>
                  <h3 className="text-xl font-bold">Administrator Dashboard</h3>
                  <p className="text-center text-sm">
                    Login to administrator dashboard.
                  </p>
                </>
              }
              skeletons={[
                { className: "w-1/2 h-6" },
                { className: "w-1/3 h-4" },
              ]}
            />
          </div>

          <div className="mx-auto space-y-7 md:space-y-5">
            <Animate
              content={
                <>
                  <Input
                    control={control}
                    name="user"
                    autoComplete="email"
                    placeholder="Email address"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: EmailPattern,
                        message: "Enter a valid email address",
                      },
                    }}
                  />
                  <Input
                    type="password"
                    control={control}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    rules={{ required: "Password is required" }}
                  />
                </>
              }
              skeletons={[
                { className: "w-full h-8" },
                { className: "w-full h-8" },
              ]}
            />
            <div className="flex justify-end">
              <Animate
                content={<Button type="submit">Login</Button>}
                skeletons={[{ className: "h-9 w-32" }]}
              />
            </div>
          </div>
        </form>
      </div>
    </PageMeta>
  );
};
export default AdminLogin;
