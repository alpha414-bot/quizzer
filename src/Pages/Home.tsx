import Animate from "@/Components/Animate";
import LinkAsButton from "@/Components/LinkAsButton";
import App from "@/Layouts/App";
import PageMeta from "@/Layouts/PageMeta";
import Hero from "@/assets/lottie/hero.json";
import Lottie from "lottie-react";

const Home = () => {
  return (
    <App>
      <PageMeta title="Welcome to Quizzer">
        <div className="my-2 space-y-12 px-8">
          <div className="flex items-center gap-12">
            <div className="grow space-y-6">
              <div className="space-y-2">
                <Animate
                  content={<h4 className="text-7xl font-semibold">Quizzer</h4>}
                  skeletons={[{ className: "!h-16 !w-3/6" }]}
                />
                <Animate
                  content={
                    <p className="text-base">
                      Welcome to quizzer application, take your company/employee
                      or random quizzes. To get started, click on the "Get
                      Started" below.
                    </p>
                  }
                  skeletons={[
                    { className: "!h-5 !w-full" },
                    { className: "!h-5 !w-4/5" },
                  ]}
                />
              </div>
              <Animate
                content={<LinkAsButton to="/quizzes">Get Started</LinkAsButton>}
                skeletons={[{ className: "!mt-2 !h-9 !w-32" }]}
              />
            </div>
            <div className="max-w-[45%] min-w-[45%]">
              <Animate
                content={<Lottie animationData={Hero} loop={true} />}
                skeletons={[{ className: "!h-72 !w-full" }]}
              />
            </div>
          </div>
        </div>
      </PageMeta>
    </App>
  );
};

export default Home;
