import React, { lazy, useContext, useRef, useState } from "react";
import { BiFilterAlt, BiSearch } from "react-icons/bi";
import { FaPlus, FaRegCheckCircle } from "react-icons/fa";
import { HiSquares2X2 } from "react-icons/hi2";
import { ImBooks } from "react-icons/im";
import { IoBookOutline } from "react-icons/io5";
import myContext from "../context/myContext";
import AllBooks from "./AllBooks";
import DeleteBook from "./DeleteBook";
const UpdateBook = lazy(()=> import('./UpdateBook'))
const AddBook = lazy(()=> import('./AddBook'))
import Overview from "./Overview";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../Components/ui/drawer.jsx";
import { Button } from "@base-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { toast } from "react-toastify";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/FirebaseConfig";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const context = useContext(myContext);
  const { loading, setLoading } = context;
  const [activeTab, setActiveTab] = useState("overview");
  const [bookIdForUpdate, setBookIdForUpdate] = useState("");
  const [bookIdForDelete, setBookIdForDelete] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("users"));
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = today.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  const greeting = getGreeting();

  const [userInput, setUserInput] = useState("");
  const getBookId = (id) => {
    setBookIdForDelete(id);
    setActiveTab("delete-book");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  const logOut = async () =>{
    try {
      signOut(auth).then(()=>{
        toast.success(`${user?.name} logged out.`);
        navigate('/');
        localStorage.clear();
      }).catch((error)=>{
        toast.error("Log out error.");
      })
    } catch (error) {
      console.log(error);
      toast.error("Errow while loggin out.");
    }
  }

  return (
    <div className="flex flex-row relative">
      {/* Left side for mobile and tablet*/}
      <div className="block lg:hidden absolute">
        <Drawer
          swipeDirection="left"
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        >
          <DrawerTrigger
            render={<Button variant="outline" />}
            className="text-3xl p-3 cursor-pointer"
          >
            <GiHamburgerMenu />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex gap-x-2">
                <ImBooks className="bg-gray-800 text-white rounded-md p-1 text-5xl" />{" "}
                <div className="flex flex-col gap-x-2">
                  <h1 className="text-2xl font-semibold">Library</h1>{" "}
                  <small className="secondaryColor">Staff Workspace</small>
                </div>
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <ul>
                <li
                  onClick={() => handleTabClick("overview")}
                  className="text-lg flex gap-x-1 items-center bg-accent p-2 rounded-lg cursor-pointer font-semibold"
                >
                  <HiSquares2X2 /> Overview
                </li>
                <li
                  onClick={() => handleTabClick("catalog")}
                  className="text-lg flex gap-x-1 items-center bg-accent p-2 rounded-lg cursor-pointer font-semibold mt-2"
                >
                  <IoBookOutline /> Book Catalog
                </li>
              </ul>
            </div>
          <DrawerFooter onClick={logOut} className='text-lg font-semibold cursor-pointer border text-center pt-3 bg-red-600 text-white'>Log out</DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Left side for desktop */}
      <div className="left w-[300px] p-4 hidden lg:block shrink-0">
        <div className="flex items-center gap-x-4">
          <div>
            <ImBooks className="bg-gray-800 text-white rounded-md p-1 text-5xl" />
          </div>
          <div className="leading-0">
            <h2 className="text-2xl font-semibold"> Library</h2>
            <span className="text-xs">Staff Workspace</span>
          </div>
        </div>

        <ul className="mt-10">
          <li
            onClick={() => setActiveTab("overview")}
            className={`${activeTab == "overview" ? "bg-gray-900" : "bg-accent"} flex items-center p-4 bg-gray-400 duration-200 hover:bg-gray-600 rounded-lg gap-x-2 text-white font-semibold cursor-pointer mb-2`}
          >
            <HiSquares2X2 /> Overview
          </li>
          <li
            onClick={() => setActiveTab("catalog")}
            className={`${activeTab == "catalog" ? "bg-gray-900" : "bg-accent"} flex items-center p-4 bg-gray-400 duration-200 hover:bg-gray-600 rounded-lg gap-x-2 text-white font-semibold cursor-pointer mb-2`}
          >
            <IoBookOutline /> Book Catalog
          </li>
        </ul>
      </div>

      {/* Right Side */}
      <div className="right w-full md:max-w-screen min-h-screen bg-gray-100 p-8 pt-20 lg:pt-8">
        {(activeTab == "overview" || activeTab == "catalog") && (
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-gray-400">{formattedDate}</h2>
              <h1 className="font-bold text-2xl">
                {greeting}, {user?.name}
              </h1>
            </div>
            <div>
              <button
                onClick={() => setActiveTab("add-book")}
                className="flex items-center gap-x-1 bg-gray-700 hover:bg-gray-600 duration-200 rounded-lg text-white px-3 py-2 mb-2 cursor-pointer"
              >
                <FaPlus /> Add a Book
              </button>
            </div>
          </div>
        )}
        {activeTab == "overview" && <Overview setActiveTab={setActiveTab} />}
        {activeTab == "catalog" && (
          <>
            <section className="mt-5 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                {/* Search */}
                <div className="relative w-full lg:max-w-md lg:flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500">
                    <BiSearch />
                  </span>
                  <input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                    placeholder="Search by title, author, ISBN, or shelf location"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                  <button className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand hover:bg-brand-light hover:text-brand">
                    <BiFilterAlt /> All Categories
                  </button>

                  <button className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand hover:bg-brand-light hover:text-brand">
                    <FaRegCheckCircle /> Availability
                  </button>

                  <div className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700">
                    <span className="text-gray-500">Sort:</span>
                    <select className="cursor-pointer bg-transparent outline-none">
                      <option value="">Recently Updated</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <AllBooks
                getBookId={getBookId}
                setActiveTab={setActiveTab}
                setBookIdForDelete={setBookIdForDelete}
                setBookIdForUpdate={setBookIdForUpdate}
                userInput={userInput}
              />
            </section>
          </>
        )}

        {activeTab == "add-book" && <AddBook setActiveTab={setActiveTab} />}

        {activeTab == "delete-book" && (
          <section>
            <DeleteBook
              bookIdForDelete={bookIdForDelete}
              setActiveTab={setActiveTab}
            />
          </section>
        )}

        {activeTab == "edit-book" && (
          <section>
            <UpdateBook
              bookIdForUpdate={bookIdForUpdate}
              setActiveTab={setActiveTab}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
