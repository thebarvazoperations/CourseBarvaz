import { Helmet } from "react-helmet-async";

export default function SEOMeta({ title, description }) {
  const fullTitle = title ? `${title} | כלי המשכנתא` : "כלי המשכנתא — זה לא יועץ משכנתאות. זה יותר טוב.";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
