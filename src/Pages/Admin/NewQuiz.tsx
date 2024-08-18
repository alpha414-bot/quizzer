import Button from "@/Components/Button";
import Input from "@/Components/Input";
import MediaModal from "@/Components/MediaModal";
import TextArea from "@/Components/TextArea";
import PageMeta from "@/Layouts/PageMeta";
import { createSlug, js } from "@/System/functions";
import { queryToStoreQuizMetaData } from "@/System/Module/Query";
import { QuizMetaDataInterface } from "@/Types/Module";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const NewQuiz = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm<QuizMetaDataInterface>({
    mode: "all",
  });
  const setupQuizMetaData: SubmitHandler<QuizMetaDataInterface> = (data) => {
    queryToStoreQuizMetaData({
      ...js(data),
      ...{
        slug: createSlug(data.title),
        status: "draft",
        procedure: "<p><strong>Enter the procedure here</strong></p>",
      },
    }).then((resp: any) => {
      if (!resp?.error) {
        navigate(`/admin/quiz/edit/${resp?.id}`);
      }
    });
  };
  return (
    <PageMeta title="New Quiz">
      <form
        className="space-y-6 px-4"
        onSubmit={handleSubmit(setupQuizMetaData)}
      >
        <div>
          <p className="text-sm">
            You are about to create a new quiz, enter image, title and
            description for your quiz.
          </p>
          <div className="flex items-start py-4 gap-2 justify-between">
            <div className="grow px-3 space-y-5">
              <Input
                name="title"
                control={control}
                className="text-xl placeholder:text-xl !py-3"
                placeholder="Title"
                rules={{ required: "Title is required" }}
              />
              <TextArea
                name="description"
                control={control}
                className="text-xl placeholder:text-xl"
                placeholder="Description"
                rules={{ required: "Description is required" }}
                rows={5}
              />
            </div>
            <div className="min-w-48">
              <MediaModal
                control={control}
                name="image"
                placeholder="Image"
                align="col"
                rules={{ required: "Image is required" }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            icon={
              <svg
                className="w-6 h-6 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.8"
                  d="m9 5 7 7-7 7"
                />
              </svg>
            }
          >
            Continue
          </Button>
        </div>
      </form>
    </PageMeta>
  );
};

export default NewQuiz;
