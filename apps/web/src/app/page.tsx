import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Users, Zap, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "Truth or Dare Online - The Ultimate Party Game",
  description:
    "Play Truth or Dare online with friends! Choose from multiple categories, create private rooms, and enjoy hours of fun. Perfect for virtual parties and gatherings.",
};

export default function Home() {
  return (
    <div className="min-h-screen ">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold  mb-4">
            Truth or Dare: Unleash the Fun!
          </h2>
          <p className=" text-sm  sm:text-base md:text-lg  mb-8">
            Join the ultimate online party game. Connect with friends, challenge
            your limits, and create unforgettable memories.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/category">
              <Button size="lg">
                Play Online <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/room/classic">
              <Button size="lg" variant="outline">
                Join Game
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-4 h-12 w-12" />
              <h3 className="text-xl font-semibold mb-2">
                Multiple Categories
              </h3>
              <p>
                Choose from Classic, Adult, Teen, Couple, and Spicy categories
                to suit any crowd.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12" />
              <h3 className="text-xl font-semibold mb-2">Instant Fun</h3>
              <p>
                No downloads required. Start playing immediately in your
                browser.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12" />
              <h3 className="text-xl font-semibold mb-2">Private Rooms</h3>
              <p>Create password-protected rooms for you and your friends.</p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold  mb-8">What Players Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">
                  &quot;This is the best online Truth or Dare game I&apos;ve
                  played. So much fun with friends!&quot;
                </p>
                <p className="font-semibold">- Sarah K.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="italic mb-4">
                  &quot;Love the different categories. Perfect for our virtual
                  game nights!&quot;
                </p>
                <p className="font-semibold">- Mike R.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold  mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-3xl mx-auto"
          >
            <AccordionItem value="item-1" className="border-blue-200/40">
              <AccordionTrigger className=" ">
                Is it free to play?
              </AccordionTrigger>
              <AccordionContent className="">
                Yes, TruthOrDare.io is completely free to play. Just create a
                room or join one to start the fun!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-blue-200/40">
              <AccordionTrigger className=" ">
                How many players can join a game?
              </AccordionTrigger>
              <AccordionContent className="">
                You can create rooms for 2 to 10 players. It&apos;s perfect for
                small gatherings or bigger parties!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-blue-200/40">
              <AccordionTrigger className=" ">
                Is the content appropriate for all ages?
              </AccordionTrigger>
              <AccordionContent className="">
                We offer different categories to suit various age groups and
                preferences. Always check the category before playing!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-blue-200/40">
              <AccordionTrigger className=" ">
                Can I play on my mobile device?
              </AccordionTrigger>
              <AccordionContent className="">
                Our game is fully responsive and works great on smartphones and
                tablets.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className=" ">
                How do I report inappropriate content?
              </AccordionTrigger>
              <AccordionContent className="">
                We take content moderation seriously. If you encounter any
                inappropriate content, please use the &apos;Report&apos; button
                in the game or contact our support team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </div>
  );
}
