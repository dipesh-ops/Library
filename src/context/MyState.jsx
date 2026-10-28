import React, { useEffect, useState } from 'react'
import myContext from './myContext'
import { toast } from 'react-toastify';
import { collection, onSnapshot, query, QuerySnapshot, where } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';

function MyState({children}) {
    const [loading, setLoading] = useState(false);
    const [getBooks, setGetBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [hold, setHold] = useState([]);
    const name = "Dipesh";
    const user = JSON.parse(localStorage.getItem("users"));

     const getAllBooks = () =>{
      setLoading(true);
    try {
      const q = query(
        collection(fireDB, "book")
      );

      const data = onSnapshot(q, (QuerySnapshot)=>{
        let booksArr = [];

        QuerySnapshot.forEach((doc)=> {
          booksArr.push({...doc.data(), id : doc.id})
        })
        setGetBooks(booksArr);
        console.log(booksArr);
        setLoading(false);
      })

      return ()=> data; 
    } catch (error) {
      console.log(error);
      toast.error("Error while getting books");
      setLoading(false);
    }
  }

  const getBorrowedBooks = async () => {
    setLoading(true);
    const q = query(
      collection(fireDB, "borrowings"),
      where("userId", "==", user?.uid)
    );

    const data = onSnapshot(q, (QuerySnapshot)=>{
      let books = [];
      QuerySnapshot.forEach((doc)=>{
        books.push({...doc.data(), id : doc.id});
      });
      setBorrowedBooks(books);
      setLoading(false);
    })
  }

  const getholds = async () =>{
    setLoading(true);
    const q = query(
      collection(fireDB, "holds"),
      where("userId", "==", user?.uid)
    )

    const data = onSnapshot(q, (QuerySnapshot)=>{
      let holds = [];

      QuerySnapshot.forEach((doc)=>{
        holds.push({...doc.data(), id : doc.id});
      })
      setHold(holds);
      setLoading(false);
    })
  }
useEffect(()=>{
  getAllBooks();
  getBorrowedBooks();
  getholds();
}, [])
  return (
   <myContext.Provider value={{loading, setLoading, name, getBooks, getAllBooks, borrowedBooks, hold}}>
        {children}
   </myContext.Provider>
  )
}

export default MyState