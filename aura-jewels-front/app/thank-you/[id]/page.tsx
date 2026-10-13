import ThankYou from "../_components/ThankYou";
import { cookies } from "next/headers";
import { getOrderById } from "@/services/orderService";

async function fetchOrderDetailServer(id: string) {
    if (!id) return null;
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value || cookieStore.get("token")?.value;
    const orderDetail = await getOrderById(id, token);

    console.log("order Details", orderDetail)

    return orderDetail;
}

const Page = async ({ params }: any) => {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const initialData = await fetchOrderDetailServer(id);

    return <ThankYou id={id} initialData={initialData} />;
};

export default Page;