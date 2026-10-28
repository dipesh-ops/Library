import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { IoMdBook } from "react-icons/io";
import { MdCheck } from "react-icons/md";
import { CiCircleCheck } from "react-icons/ci";
import { TbRefresh } from "react-icons/tb";
import myContext from "../context/myContext";
import { auth, fireDB } from "../firebase/FirebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "./Loading";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const LOAN_DAYS = 14; // change to your library's policy

// Strip time so we compare calendar days only
const toMidnight = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Difference in calendar days (b - a)
const daysBetween = (a, b) =>
  Math.round((toMidnight(b) - toMidnight(a)) / MS_PER_DAY);

// Add N days to a date
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const Borrowing = () => {
  const user = JSON.parse(localStorage.getItem("users"));
  const context = useContext(myContext);
  const { borrowedBooks, hold, loading } = context;
  console.log(hold);
  const navigate = useNavigate();

  const [today, setToday] = useState(() => new Date());
  const [pickupDate, setPickupDate] = useState(today);

  // Update "today" at midnight so daysLeft recalculates automatically
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const timeout = setTimeout(() => setToday(new Date()), nextMidnight - now);

    return () => clearTimeout(timeout);
  }, [today]);

  // Also refresh when the user returns to the tab (fixes sleep/throttling)
  useEffect(() => {
    const refresh = () => setToday(new Date());
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    const removedExpired = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(fireDB, "borrowings"),
          where("userId", "==", user.uid),
        );

        const snapshot = await getDocs(q);

        const expired = snapshot.docs.filter((d) => {
          const data = d.data();
          const dueDate = new Date(d.data().dueDate);
          return daysBetween(today, dueDate) < 0;
        });

        if (expired.length === 0) return;

        await Promise.all(
          expired.map(async (d) => {
            await deleteDoc(doc(fireDB, "borrowings", d.id));
            const data = d.data();
            if (data.bookId) {
              await updateDoc(doc(fireDB, "book", data.bookId), {
                availableCopies: increment(1),
              });
            }
          }),
        );
      } catch (error) {
        console.log(error);
      }
    };

    removedExpired();
  }, [today]);

  const cancelHold = async (id) => {
    try {
      await deleteDoc(doc(fireDB, "holds", id));
      toast.success("Hold canceled successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Error while cancel hold.");
    }
  };
  return (
    <div>
      <Navbar />
      <div className="p-8 md:px-24 py-10">
        <div className="flex relative">
          <div>
            <h3 className="text-sm md:text-md font-semibold text-[#32735a] capitalize">
              {user?.name}
            </h3>
            <h1 className="text-2xl md:text-4xl font-bold primaryColor">My borrowing</h1>
            <p className="text-sm md:text-md secondaryColor">
              Keep track of your reads, renewals, and holds.
            </p>
          </div>

          <div>
            <button onClick={()=> navigate('/all-books')} className="text-sm font-semibold btn absolute md:bottom-0 md:right-0 hidden md:block">
              Browse Catalog
            </button>
          </div>
        </div>

        <Tabs className="mt-10">
          <TabList className="grid grid-cols-1 md:grid-cols-3 cursor-pointer">
            <Tab className="mr-4 mb-4 shadow-lg p-4 rounded-lg border border-gray-400/20">
              <div className="flex justify-between font-medium text-sm">
                <h2>Checked out</h2>
                <IoMdBook className="text-2xl" />
              </div>
              <h1 className="text-3xl font-bold">{borrowedBooks.length}</h1>
              <p className="secondaryColor text-sm">
                of 10 borrowing slots used
              </p>
            </Tab>

            <Tab className="mr-4 mb-4 shadow-lg p-4 rounded-lg border border-gray-400/20">
              <div className="flex justify-between font-medium text-sm">
                <h2>Ready for pickup</h2>
                <IoMdBook className="text-2xl" />
              </div>
              <h1 className="text-3xl font-bold">1</h1>
              <p className="secondaryColor text-sm">Hold expires Sep 18 </p>
            </Tab>

            <Tab className="mr-4 mb-4 shadow-lg p-4 rounded-lg border border-gray-400/20">
              <div className="flex justify-between font-medium text-sm">
                <h2>No late fees</h2>
                <CiCircleCheck className="text-2xl" />
              </div>
              <h1 className="text-3xl font-bold">All clear</h1>
              <p className="secondaryColor text-sm">
                Your account is in good standing
              </p>
            </Tab>
          </TabList>

          <TabPanel>
            {loading ? <Loading/> : <div>
              <div className="flex justify-between mt-5">
                <div>
                  <h2 className="text-lg font-semibold">Currently reading</h2>
                  <p className="text-sm secondaryColor">
                    Renew eligible titles before their due date.
                  </p>
                </div>
                <div>
                  <button className="text-sm font-medium border border-gray-200/80 p-2 rounded-lg hidden md:block">
                    Renew selected
                  </button>
                </div>
              </div>

              {borrowedBooks.map((bb, index) => {
                const dueDate = new Date(bb.dueDate);
                const daysLeft = daysBetween(today, dueDate);
                const isOverdue = daysLeft < 0;
                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-x-4 bg-[#FFFEFA] rounded-lg shadow-lg border border-gray-200/80 mt-5 p-4"
                  >
                    <div className="bg-[#173b4d] rounded-lg w-full md:w-20  md:justify-center">
                      <img src={bb.coverImage} className="w-full h-60 md:w-40 md:h-25  text-sm font-bold text-[#FFFEFA] rounded-lg p-1"/>
                      <div className="px-2 text-[#FFFEFA]">
                      </div>

                    </div>
                    <div className="w-[200px] md:w-[481px]">
                      <h2 className="text-lg font-semibold">{bb.title}</h2>
                      <p className="secondaryColor">{bb.authorName}</p>
                      {daysLeft <= 7 ? (
                        <button className="text-sm font-semibold bg-[#dce9e2] rounded-lg p-1 flex items-center gap-x-2 mt-1">
                          <TbRefresh className="greenColor text-md" />{" "}
                          {bb.renewalsLeft} renewal remaining
                        </button>
                      ) : (
                        <span className="text-sm font-semibold secondaryColor">
                          Returned automatically when finished.
                        </span>
                      )}
                    </div>
                    <div className="w-[150px] md:w-[281px]">
                      <span className="text-sm font-semibold secondaryColor">
                        DUE DATE
                      </span>
                      <h2 className="text-md font-semibold">
                        {bb.dueDate.slice(0, 10)}
                      </h2>
                      <span className="text-sm secondaryColor">
                        {daysLeft} days remaining
                      </span>
                    </div>
                    <div className="w-[180px]">
                      {daysLeft <= 7 ? (
                        <button className="btn mt-2 md:mt-0 md:float-end">Renew</button>
                      ) : (
                        <button className="mt-2 md:mt-0 md:float-end cursor-pointer p-2 border border-gray-200/80 rounded-lg shadow-lg cursor-pointer">
                          Read now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {hold.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold">Holds</h2>
                  <p className="secondaryColor text-sm">
                    We will keep pickup titles for seven days.
                  </p>

                  {hold.map((h, index) => {
                    return (
                      <div
                        key={index}
                        className="shadow-lg border border-gray-200/80 mt-5 p-4 rounded-lg flex md:justify-between items-center"
                      >
                        <div className="flex gap-x-4">
                          <img
                            src={h?.coverImage}
                            alt="no image"
                            className="md:w-[48px] md:h-[64px] w-28 bg-[#e8ede6] rounded-lg"
                          />
                          <div>
                            <h2 className="font-semibold">{h?.title}</h2>
                            <p className="text-sm secondaryColor">
                              {h?.authorName}
                            </p>
                            <span className="font-semibold greenColor text-sm">
                              Pick up by {h?.expectedAvailableAt.slice(0, 10)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row mt-30 md:mt-0 -ml-30">
                          <button
                            onClick={() => cancelHold(h?.id)}
                            className="font-semibold text-sm md:text-md mr-2 border border-gray-200/80 p-2 rounded-lg shadow-lg cursor-pointer"
                          >
                            Cancel hold
                          </button>
                          <button
                            onClick={() => navigate(`/view/${h?.bookId}`)}
                            className="btn text-sm md:text-md"
                          >
                            View book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>}
          </TabPanel>

          <TabPanel>title 2 is here</TabPanel>

          <TabPanel>title 3 is here</TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default Borrowing;
