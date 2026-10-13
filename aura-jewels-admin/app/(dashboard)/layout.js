import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Main from "@/components/partials/main";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("aura-admin-token")?.value;
  if (!token) {
    redirect("/login");
  }

  return (
    <>
      <Main>{children}</Main>
    </>
  );
}
