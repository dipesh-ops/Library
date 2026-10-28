import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { CiCircleCheck } from "react-icons/ci";
import myContext from '../context/myContext';
import { auth, fireDB } from "../firebase/FirebaseConfig";
import { toast } from "react-toastify";
import { addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, QuerySnapshot, serverTimestamp, updateDoc, where } from "firebase/firestore";
import Loading from "./Loading";

const LOAN_DAYS = 14;
const ViewBook = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [loading, setLoading] = useState(false);

  const context = useContext(myContext);
  const {getBooks, borrowedBooks} = context;
  const isBorrowed = borrowedBooks.some(b=> b.userId === auth?.currentUser?.uid && b.bookId === id && b.status === "checked-out");
  console.log(isBorrowed)
  
  const getBook = getBooks.filter(b => b.id === id);
  const book = getBook[0];
  console.log(book?.availableCopies)

  const borrow = async () =>{
    if(!book) return;
    const user = auth.currentUser;
    const userRole = JSON.parse(localStorage.getItem("users"));
    if(!user){
      toast.info("Please log in to borrow a book");
      return;
    }

    if(userRole?.role === "admin"){
      return toast.info("Admin cannot borrow the book.");
    }

    if(book.availableCopies < 0) return;

    const pickupDate = new Date();
    const dueDate = new Date(pickupDate);
    dueDate.setDate(dueDate.getDate() + LOAN_DAYS);

    try {
      setLoading(true);
      await addDoc(collection(fireDB, "borrowings"), {
        title : book.title,
        userId : user.uid,
        bookId : book.id,
        userEmail : user.email,
        coverImage : book.coverImage,
        authorName : book.authorName,
        pickupDate : pickupDate.toISOString(),
        dueDate : dueDate.toISOString(),
        status : "checked-out",
        renewalsLeft : 1,
        createdAt : serverTimestamp()
      })

      await updateDoc(doc(fireDB, "book", book.id), {
        availableCopies : book.availableCopies - 1
      });

      setLoading(false);
      toast.success("Book borrowed successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Error while borrowing a book.");
      setLoading(false);
    }
  }

  const placeHold = async () =>{
     console.log("placeHold clicked");
  if (!book) { console.log("no book"); return; }

  if(isBorrowed){toast.info("Book is already borrowed."); return; };
  
  const user = auth.currentUser;
  const userRole = JSON.parse(localStorage.getItem("users"));
  if(userRole?.role === "admin"){
    return toast.info("Admin cannot hold a book.");
  }
  if (!user) { console.log("no user"); toast.info("Please login first"); return; }

  if (book.availableCopies > 0) {
    console.log("copies available, cannot hold");
    toast.info("Copies are available — borrow instead.");
    return;
  }

  
  try {
    console.log("checking duplicate holds...");
    const existing = await getDocs(query(
      collection(fireDB, "holds"),
      where("userId", "==", user.uid),
      where("bookId", "==", id),
      where("status", "in", ["pending", "ready"])
    ));
    console.log("existing holds:", existing.size);
    if (!existing.empty) {
      toast.info("You already have a hold on this book.");
      return;
    }

    console.log("querying earliest due date...");
    const q = query(
      collection(fireDB, "borrowings"),
      where("bookId", "==", id),
      where("status", "==", "checked-out"),
      orderBy("dueDate", "asc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    console.log("earliest due snapshot size:", snapshot.size);

    // Handle the empty case gracefully — don't bail silently
    const expectedDue = snapshot.empty ? null : snapshot.docs[0].data().dueDate;
    console.log("expectedDue:", expectedDue);

    console.log("writing hold doc...");
    
     await addDoc(collection(fireDB, "holds"), {
      title: book.title,
      userId: user.uid,
      bookId: book.id,
      userEmail: user.email,
      coverImage: book.coverImage,
      authorName: book.authorName,
      status: "pending",
      readyAt: null,
      expectedAvailableAt: expectedDue,
      createdAt: serverTimestamp(),
    });

    console.log("hold placed!");

      toast.success("Hold placed. We'll notify you when a copy is ready.");
    } catch (error) {
      console.log(error);
      toast.error("Error while hold a book");
    }
  }

  const canBorrow = book?.availableCopies > 0 && !isBorrowed;
  const canHold = book?.availableCopies === 0;

  return (
    <div>
      <Navbar />
      <div className="px-8 md:px-24 py-[40px]">
        <div
          onClick={() => navigate(-1)}
          className="flex items-center gap-x-2 cursor-pointer"
        >
          <BiLeftArrowAlt className="text-2xl" /> Back to Catalog
        </div>

        {!getBook.length ? <Loading/> : <div className="flex flex-col md:flex-row gap-x-5">
          <div className="left h-full mt-5">
            <div className=" bg-[#173b4d] rounded-lg flex justify-center items-center">
              <div className="rounded-lg">
                <img className="rounded-lg" src={book?.coverImage} alt="" />
              </div>
            </div>
          </div>
          <div className="right mt-5">
            <h3 className="text-[#32735a] text-[14px] font-semibold">
            {book?.category}
            </h3>
            <h1 className="text-[#1c2938] font-bold text-2xl md:text-4xl">
              {book?.title}
            </h1>
            <span className="text-[#616c6c]">{book?.authorName}</span>
            <div className="bg-[#fffefa] p-4 rounded-lg shadow-lg flex justify-between items-center gap-x-2">
              <div className="flex gap-x-2">
                <p className="bg-[#dce9e2] w-[44px] h-[44px] rounded-full relative flex justify-center items-center text-2xl font-semibold"><CiCircleCheck className="absolute text-[#32735a]"/></p>
              <div>
                <h2 className="font-semibold text-lg">Available</h2>
              <p className="text-sm text-[#616c6c]">{book?.availableCopies} of {book?.totalCopies} print copies are on the shelf now.</p>
              </div>
              </div>

              <div className="text-end">
                 {!isBorrowed ? <button disabled={!canBorrow} onClick={borrow} className={`p-2 rounded-lg font-semibold ${canBorrow ?`cursor-pointer bg-[#173b4d] text-[#FFFEFA]` : `cursor-not-allowed border border-gray-200/20`}`}>{book?.availableCopies > 0 ? "Borrow the book" : "Currently Unavailable"}</button>
                :
                <button onClick={()=> navigate("/borrowing")} className="btn">View Borrowings</button> 
                }
              </div>
            </div>

            <div className="mt-5 md:w-[646px]">
                <h2 className="text-[#1c2938] text-lg font-semibold">About this book</h2>
                <p className="text-sm text-[#616c6c]">{book?.description}</p>
            </div>

            <div className="mt-10 border-t border-t-[#616c6c] py-2">
              <h1 className="text-lg font-semibold">Need more time?</h1>
              <p className="text-sm text-[#616c6c]">If all copies are checked out, we will notify you when one is ready.</p>
              <button onClick={placeHold} disabled={!canHold} className={`text-sm font-semibold p-2 mt-2  border rounded-lg border-[#616c6c] ${book?.availableCopies === 0 ? "cursor-pointer" : "cursor-not-allowed"}`}>Place a hold</button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default ViewBook;
