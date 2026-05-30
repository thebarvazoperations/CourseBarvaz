import { useEffect } from "react";

export default function SEOMeta({ title, description }) {
  useEffect(() => {
    document.title = title
      ? `${title} | כלי המשכנתא`
      : "כלי המשכנתא — זה לא יועץ משכנתאות. זה יותר טוב.";
  }, [title]);

  useEffect(() => {
    if (!description) return;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, [description]);

  return null;
}
