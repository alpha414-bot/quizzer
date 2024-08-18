import Button from "@/Components/Button";
import Img from "@/Components/Img";
import LinkAsButton from "@/Components/LinkAsButton";
import PageMeta from "@/Layouts/PageMeta";
import { fm } from "@/System/functions";
import { useQuiz } from "@/System/Module/Hook";
import { queryToDeleteQuiz } from "@/System/Module/Query";
import { QuizDataInterface } from "@/Types/Module";
import _ from "lodash";
import moment from "moment";
import { NavLink, useNavigate, useParams } from "react-router-dom";

const AdminQuizs = () => {
  const { state } = useParams();
  const { data } = useQuiz<QuizDataInterface[]>(
    null,
    _.replace(state as string, ":", "")
  );
  const navigate = useNavigate();
  return (
    <PageMeta title={`Quizs`}>
      <div className="px-6">
        {/* Filers */}
        <div className="mb-7 space-y-3">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-bold">Quizs</h2>
            </div>
            <button className="flex items-center gap-1 px-4 py-1 text-base text-gray-700 font-medium border border-gray-400 rounded-lg">
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              Export
            </button>
          </div>
          {/* Search Filters / Add New */}
          <div className="flex items-center gap-3 justify-between">
            {/* Search */}
            <div className="">
              <label htmlFor="topbar-search" className="sr-only">
                Search
              </label>
              <div className="relative md:w-72">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search-quiz"
                  id="topbar-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                  placeholder="Search..."
                />
              </div>
            </div>
            {/* Add */}
            <LinkAsButton to="/admin/new/quiz">New Quiz</LinkAsButton>
          </div>
          <hr />
          {/* Filters */}
          <div className="flex items-center gap-4 text-sm font-exo font-semibold text-gray-600">
            {["active", "draft", "archive"].map((item, index) => (
              <NavLink
                key={index}
                // to={`/admin/q/:${item}`}
                to={`../q/:${item}`}
                relative="route"
                className={({ isActive }) =>
                  `px-2 py-0.5 rounded-md ${
                    isActive ? "bg-purple-400 text-white" : ""
                  }`
                }
              >
                {_.startCase(item)}
              </NavLink>
            ))}
          </div>
        </div>
        {/* Data */}
        <div className="space-y-4 bg-gray-100 py-4 px-6 rounded-lg">
          {data &&
            data.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[12rem_1fr_minmax(2rem,4.5rem)] gap-4 min-h-36 items-stretch bg-white overflow-hidden rounded-2xl cursor-pointer transition-all ease-in-out dela-100 duration-300 scale-100 hover:scale-[1.03]"
                onClick={() => {
                  console.log("show me");
                }}
              >
                {/* {js(item.image, true)} */}
                <Img
                  type="background"
                  src={item.image?.media.fullPath}
                  className="relative bg-contain bg-no-repeat bg-center min-w-0 h-full rounded-ss-2xl rounded-es-2xl overflow-hidden"
                  child={
                    <p className="absolute z-10 top-3 left-2 text-[0.6rem] px-2 py-0.5 text-white bg-gray-600 bg-opacity-40 rounded">
                      {moment(fm(item.createdAt)).format("Do MMMM YYYY hh:mma")}
                    </p>
                  }
                />
                <div className="py-2 space-y-0.5">
                  <p className="text-xl font-medium tracking-tight">
                    {_.upperFirst(item.title)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="text-xs flex items-center gap-1 text-gray-400">
                      {item.questions.length} questions
                    </div>
                    {/* Average Time for quiz */}
                    <div className="text-xs flex items-center gap-1 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      165 min
                    </div>
                  </div>
                  {/* minium character of 150 */}
                  <p className="text-sm text-gray-600 font-medium">
                    {item.description}
                  </p>
                </div>
                <div className="relative z-20 flex flex-col items-end justify-evenly gap-2 py-3 px-4">
                  {[
                    {
                      name: "Report",
                      click: () => {
                        navigate(`/admin/quiz/report/${item.id}`);
                      },
                      path: (
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667"
                        />
                      ),
                    },
                    {
                      name: "Edit",
                      click: () => {
                        navigate(`/admin/quiz/edit/${item.id}`);
                      },
                      path: (
                        <>
                          <path
                            fillRule="evenodd"
                            d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
                            clipRule="evenodd"
                          />
                          <path
                            fillRule="evenodd"
                            d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                            clipRule="evenodd"
                          />
                        </>
                      ),
                    },
                    {
                      name: "Delete",
                      click: () => {
                        // delete quiz
                        queryToDeleteQuiz(item.id)
                      },
                      path: (
                        <>
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                          />
                        </>
                      ),
                    },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      className="relative inline-flex w-auto items-center text-white font-medium !px-0.5 !py-1 gap-1 rounded-md group"
                      onClick={(e) => {
                        e.stopPropagation();
                        return item.click();
                      }}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill={item.name == "Edit" ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                      >
                        {item.path}
                      </svg>
                      <span className="hidden absolute right-[130%] transition-all ease-in-out duration-150 delay-75 text-xs underline underline-offset-2 decoration-dotted group-hover:block text-gray-700">
                        {item.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          {data && data.length == 0 && (
            <div className="py-2 text-gray-700">
              <p className="text-center font-medium tracking-wide">
                No quiz in this category
              </p>
            </div>
          )}
        </div>
      </div>
    </PageMeta>
  );
};

export default AdminQuizs;
