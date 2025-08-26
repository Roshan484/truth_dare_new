export const useGetAllCategories = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories`,
    {
      method: "GET",
      next: {
        revalidate: 10 * 60,
      },
    }
  );
  const data = await response.json();

  return data.categories;
};
