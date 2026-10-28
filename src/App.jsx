import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
const About = lazy(()=> import('./Components/About'));
import AllBooks from "./Components/AllBooks";
import UserDetails from "./Components/UserDetails";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import { Bounce, ToastContainer } from "react-toastify";
import MyState from "./context/MyState";
const AdminDashboard = lazy(()=> import('./Components/AdminDashboard'));
import ProtectedRouteForAdmin from "./Components/ProtectedRouteForAdmin";
const DeleteBook = lazy(()=> import('./Components/DeleteBook'));
const Borrowing = lazy(()=> import('./Components/Borrowing'));
import Events from "./Components/Events";
const ViewBook = lazy(()=> import('./Components/ViewBook'));
import Loading from "./Components/Loading";
import ProtectedRouteForUser from "./Components/ProtectedRouteForUser";
import { lazy } from "react";

function App() {
  const user = JSON.stringify(localStorage.getItem("users"));
  
  return (
    <>
     <MyState>
       <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/borrowing" element={
            <ProtectedRouteForUser>
              <Borrowing />
            </ProtectedRouteForUser>
          } />
          <Route path="/events" element={<Events />} />
          <Route path="/all-books" element={<AllBooks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user/:id" element={
            <ProtectedRouteForUser>
              <UserDetails />
            </ProtectedRouteForUser>
          } />
          <Route path="/delete/:id" element={
            <ProtectedRouteForAdmin>
              <DeleteBook />
            </ProtectedRouteForAdmin>
          } />
          <Route path="/view/:id" element={<ViewBook />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/admin" element={
            <ProtectedRouteForAdmin>
              <AdminDashboard />
            </ProtectedRouteForAdmin>
          } />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
      </BrowserRouter>
     </MyState>
    </>
  );
}

export default App;
