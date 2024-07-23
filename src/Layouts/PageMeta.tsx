import { Helmet } from "react-helmet-async";

const PageMeta: React.FC<{
  children: React.ReactNode;
  title: string;
  description?: string;
  admin?: boolean;
}> = ({ children, title, description, admin }) => {
  // later title and description won't be necessary has that would be depended on the sitemap
  return (
    <>
      <Helmet>
        <title>
          {title} {admin ? `- Admin` : ""}
        </title>
        <link rel="canonical" href={window.location.origin} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {/* <meta property="og:image" content={URL of the image you want to use} /> */}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {/* <meta name="twitter:image" content={URL of the image you want to use} /> */}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {children}
    </>
  );
};
export default PageMeta;
