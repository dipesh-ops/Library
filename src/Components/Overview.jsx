import React, { useContext, useEffect, useState } from "react";
import { CiCircleCheck } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoIosArrowRoundForward } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import { useRecentActivity } from "../hooks/useRecentActivity";
import myContext from "../context/myContext";
import { collection, onSnapshot, query, QuerySnapshot } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";
import { toast } from "react-toastify";
import Loading from "./Loading";

const VERBS = {
  added: "added",
  updated: "updated",
  deleted: "deleted",
};

// turns a timestamp into "Today, 9:42 AM"
const formatWhen = (ts) => {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const today = new Date().toDateString() === date.toDateString();
  if (today) return `Today, ${time}`;

  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
};

const Overview = ({ setActiveTab }) => {
  const activity = useRecentActivity(3);
  const [titles, setTitles] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const context = useContext(myContext);
  const {getBooks, loading, setLoading} = context;

const copiesOnShelf = (getBooks || []).reduce((total, book)=> total + Number(book.availableCopies || 0), 0);

const getBorrowedBooks = async () =>{

  setLoading(true);

  try {
    const q = query(
    collection(fireDB, "borrowings")
  );

    const data = onSnapshot(q, (QuerySnapshot)=>{
      let borrowed = [];
      QuerySnapshot.forEach((doc)=>{
        borrowed.push({...doc.data(), id : doc.id});
      });
      setBorrowedBooks(borrowed);
      setLoading(false);
    })
  } catch (error) {
    console.log(error);
    toast.error("Error while fetching borrowed books");
    setLoading(false);
  }
}
  
useEffect(()=>{
  getBorrowedBooks();
}, []);
  
  return loading ?<Loading text="Overview loading"/> : (
    <div>
      <div className="grid grid-cols-1 gap-y-2 md:gap-y-0 md:grid-cols-3 gap-x-3">
        <div className="shadow-lg p-4 rounded-lg border border-gray-400/20">
          <div className="bg-gray-200 p-2 rounded-lg w-fit">
            <HiOutlineBookOpen className="text-2xl" />
          </div>
          <h1 className="text-3xl font-bold">{getBooks?.length}</h1>
          <p className="secondaryColor text-sm">Catalog titles</p>
        </div>

        <div className="shadow-lg p-4 rounded-lg border border-gray-400/20">
          <div className="bg-gray-200 p-2 rounded-lg w-fit">
            <CiCircleCheck className="text-2xl" />
          </div>
          <h1 className="text-3xl font-bold">{copiesOnShelf}</h1>
          <p className="secondaryColor text-sm">Copies on shelf</p>
        </div>

        <div className="shadow-lg p-4 rounded-lg border border-gray-400/20">
          <div className="bg-gray-200 p-2 rounded-lg w-fit">
            <LuRefreshCcw className="text-2xl" />
          </div>
          <h1 className="text-3xl font-bold">{borrowedBooks.length}</h1>
          <p className="secondaryColor text-sm">Items checked out</p>
        </div>
      </div>

      {/* Catalog activity — live from Firestore */}
      <div className="bg-[#FFFEFA] p-3 rounded-lg mt-5">
        <div className="flex justify-between">
          <div>
            <h1 className="text-lg font-semibold">Catalog activity</h1>
            <p className="text-sm secondaryColor">Recent changes across the collection</p>
          </div>
          <div
            onClick={() => setActiveTab("catalog")}
            className="flex items-center gap-x-0 shrink-0 md:gap-x-2 font-medium md:font-semibold cursor-pointer"
          >
            View catalog<IoIosArrowRoundForward />
          </div>
        </div>

        <hr className="text-gray-200 mt-4 mb-1" />

        {activity.length === 0 && (
          <p className="text-sm secondaryColor py-3">No activity yet.</p>
        )}

        {activity.map((book) => (
          <div key={book.id} className="py-3 border-b border-gray-100 last:border-0">
            <h1 className="text-sm">
              <b>{book.userName}</b> {VERBS[book.type] || book.type}{" "} <b>{book?.bookTitle}.</b>
            </h1>
            <small className="secondaryColor">
              {formatWhen(book.createdAt)}
              {book.category && ` · ${book.category}`}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;