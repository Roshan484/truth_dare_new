import { redirect } from "next/navigation";
import { useGetAllCategories } from "@/actions/get-all-categories";

const RoomIndexPage = async () => {
  const categories = await useGetAllCategories();
  const firstSlug = categories?.[0]?.slug;

  if (firstSlug) {
    redirect(`/room/${firstSlug}`);
  }

  return null;
};

export default RoomIndexPage;
