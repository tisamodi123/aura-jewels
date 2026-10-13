import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const Page = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura-admin-token")?.value;
    if (!token) {
        redirect('/login');
    } else {
        redirect('/dashboard');
    }
    return null;
}

export default Page;