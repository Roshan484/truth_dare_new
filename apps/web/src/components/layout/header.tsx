import Link from "next/link";
import React from "react";
import { Orbitron } from "next/font/google";
import { ModeToggle } from "../mode-toggle";
import UserMenu from "../user-menu";

const orbitron = Orbitron({ subsets: ["latin"] });
function Header() {
  const navs = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Truth & Dare",
      href: "truth-and-dare",
    },
    {
      name: "Anonymous Chat",
      href: "anonymous-chat",
    },

    {
      name: "Pricing",
      href: "pricing",
    },

    {
      name: "About",
      href: "about",
    },
  ];
  return (
    <nav className="sticky top-2 left-0 right-0 z-50 ">
      <div className="mx-auto">
        <div className="backdrop-blur-md  dark:bg-black/20 rounded-full border border-gray-200  dark:border-white/10 shadow-md">
          <div className="max-w-7xl mx-auto px-2 ">
            <div className="flex items-center justify-between py-2">
              <div className="w-full flex justify-between items-center">
                <div className="shrink-0">
                  <div className={`${orbitron.className} text-2xl font-bold `}>
                    <Link href="/" className="relative z-10">
                      ReckonX
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center space-x-5">
                    {navs.map((items, i) => (
                      <Link
                        href={`/${items.href}`}
                        key={i}
                        className=" flex items-center  text-sm pb-[1px] font-medium relative "
                      >
                        <span className={` text-sm font-medium `}>
                          {items.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <UserMenu />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
