import { redirect } from "next/navigation";

// The standalone create page has been retired — Category creation now
// happens through the shared modal on the /category list page, which
// keeps Add and Edit fields in sync. Existing bookmarks land back on
// the list page.
export default function CreateCategoryRedirect() {
  redirect("/category");
}
