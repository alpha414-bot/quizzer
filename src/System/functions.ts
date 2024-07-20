export const getErrorMessageViaStatus = (error: RouteErrorInterface) => {
  switch (error.status) {
    case 404:
      return {
        status: 404,
        shortMessage: "404 Not Found | We can't find that page!",
        longMessage:
          "Sorry, the page you're looking for does not exist anymore, or we've moved it somewhere else. Try selecting a link from the navigation at the top of the page. ",
      };
    default:
      return {
        ...error,
        shortMessage: error.statusText || "Error Encountered",
        longMessage:
          error.data ||
          "There was a problem with this page. Try refreshing the page, if issue persists, contact administrator.",
      };
  }
};
