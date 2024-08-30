import Img from "@/Components/Img";
import LinkAsButton from "@/Components/LinkAsButton";
import Modal from "@/Components/Modal";
import PageMeta from "@/Layouts/PageMeta";
import { fm } from "@/System/functions";
import { useQuiz } from "@/System/Module/Hook";
import { QuizDataInterface } from "@/Types/Module";
import _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import NewQuiz from "./NewQuiz";
import { queryToDeleteQuiz } from "@/System/Module/Query/Quiz";

const AdminQuizs = () => {
  const { state } = useParams();
  const { data } = useQuiz<QuizDataInterface[]>(
    null,
    _.replace(state as string, ":", "")
  );
  const [searchQuery, setSearchQuery] = useState<QuizDataInterface[]>([]);
  useEffect(() => {
    setSearchQuery(data as QuizDataInterface[]);
  }, [data]);
  return (
    <PageMeta title={`Quizs`}>
      <div>
        {/* Filers */}
        <div className="py-5 space-y-3">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-bold">Quizs</h2>
            </div>
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
                  onChange={(e) => {
                    const value = e?.target?.value;
                    const clean = (str?: string) => str?.toLowerCase().trim();
                    const q = data?.filter((item) => {
                      const filterByTitle = clean(item.title);
                      return filterByTitle?.includes(value);
                    });
                    setSearchQuery(q as QuizDataInterface[]);
                  }}
                />
              </div>
            </div>
            {/* Add */}
            <Modal
              id="NewQuiz"
              text="New Quiz"
              title="New Quiz"
              content={<NewQuiz />}
            />
          </div>
          <hr />
          {/* Filters */}
          <div className="flex items-center gap-x-2 text-sm font-exo font-semibold text-gray-600">
            {["active", "draft", "archive"].map((item, index) => (
              <NavLink
                key={index}
                // to={`/admin/q/:${item}`}
                to={`../q/:${item}`}
                relative="route"
                className={({ isActive }) =>
                  `px-2 py-0.5 rounded-md ${
                    isActive ? "bg-purple-700 text-white" : ""
                  }`
                }
              >
                {_.startCase(item)}
              </NavLink>
            ))}
          </div>
          {/* Quiz Data */}
          <div className="space-y-4 bg-gray-100/80 p-3 rounded-xl md:p-4">
            {searchQuery &&
              searchQuery.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-rows-[15rem,1fr] grid-cols-[8fr,1fr] gap-2 min-h-36 items-stretch bg-white overflow-hidden rounded-xl cursor-pointer transition-all ease-in-out duration-100 scale-100 hover:scale-[1.015] md:grid-rows-1 md:grid-cols-[12rem_1fr_minmax(2rem,4.5rem)] sm:gap-4 md:rounded-2xl"
                  onClick={() => {
                    console.log("show me");
                  }}
                >
                  <Img
                    type="background"
                    src={item.image?.media.fullPath}
                    className="relative !bg-gray-700 bg-cover bg-no-repeat bg-center w-full min-w-0 h-full overflow-hidden rounded-t-xl col-span-2 md:col-auto md:rounded-s-2xl md:rounded-e-none"
                    child={
                      <p className="absolute z-10 top-2 left-2 text-[0.6rem] px-2 py-0.5 text-white bg-gray-600 bg-opacity-40 rounded">
                        {moment(fm(item.createdAt)).format(
                          "DD MMM YYYY hh:mma"
                        )}
                      </p>
                    }
                  />
                  <div className="py-2 space-y-0.5 px-4 md:px-0">
                    <p className="text-xl font-medium tracking-tight">
                      {_.upperFirst(item.title)}
                    </p>
                    <div className="flex flex-row flex-wrap gap-x-2 gap-y-0.5">
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
                  <div className="relative z-20 flex flex-col items-end justify-evenly gap-1.5 py-3 px-4">
                    {[
                      {
                        name: "View",
                        to: `/quiz/${item.id}`,
                        new_tab: true,
                        path: (
                          <>
                            <path
                              fill-rule="evenodd"
                              d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                              clip-rule="evenodd"
                            />
                          </>
                        ),
                      },
                      {
                        name: "Report",
                        to: `/admin/quiz/report/${item.id}`,
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
                        to: `/admin/quiz/edit/${item.id}`,
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
                          queryToDeleteQuiz(item.id);
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
                      <LinkAsButton
                        to={item.to as string}
                        key={index}
                        target={item.new_tab ? "_blank" : "_self"}
                        className="relative inline-flex w-auto items-center text-white font-medium !px-0.5 !py-0.5 gap-1 rounded-md group"
                        onClick={(e) => {
                          if (!item.to && item.click) {
                            e.stopPropagation();
                            return item?.click();
                          }
                        }}
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill={
                            item.name == "Edit" || item.name == "View"
                              ? "currentColor"
                              : "none"
                          }
                          viewBox="0 0 24 24"
                        >
                          {item.path}
                        </svg>
                        <span className="hidden absolute right-[130%] transition-all ease-in-out duration-150 delay-75 text-xs underline underline-offset-2 decoration-dotted group-hover:block text-gray-700">
                          {item.name}
                        </span>
                      </LinkAsButton>
                    ))}
                  </div>
                </div>
              ))}
            {searchQuery && searchQuery.length == 0 && (
              <div className="py-1.5 text-gray-700">
                <p className="text-center font-medium ">
                  No quiz in this category
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageMeta>
  );
};

export default AdminQuizs;
