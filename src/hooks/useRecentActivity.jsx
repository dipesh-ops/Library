import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { fireDB } from "../firebase/FirebaseConfig";

export const useRecentActivity = (max = 3) => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const q = query(
      collection(fireDB, "activity"),
      orderBy("createdAt", "desc"),
      limit(max)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivity(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [max]);

  return activity;
};