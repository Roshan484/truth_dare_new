import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Heart, Users, Zap, Coffee, Flame } from "lucide-react";
import { useGetAllCategories } from "@/actions/get-all-categories";

interface Category {
  name: string;

  slug: string;
  description: string;
}

export default async function Category() {
  const categories = await useGetAllCategories();
  return (
    <div className=" overflow-hidden my-5">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-5 mt-3">
          <h1 className="text-3xl font-bold ">Truth or Dare</h1>
          <p className="text-sm  max-w-2xl mx-auto">
            Choose your adventure and dive into a world of exciting truths and
            daring challenges. Select a category below to start your game!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: Category) => (
            <Card
              key={category.name}
              className=" backdrop-blur-md transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <h1>{category.name}</h1>
                </CardTitle>
                <CardDescription className=" line-clamp-2">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={`/truth-dare/${category.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Play {category.name}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
