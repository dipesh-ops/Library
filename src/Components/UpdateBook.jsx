import React, { useContext, useEffect, useRef, useState } from "react";
import myContext from "../context/myContext";
import { BiLeftArrowAlt } from "react-icons/bi";
import { IoImageOutline } from "react-icons/io5";
import { PiWarningCircle } from "react-icons/pi";
import { GiCrossMark } from "react-icons/gi";
import { toast } from "react-toastify";
import {fireDB} from "../firebase/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { logActivity } from "../utils/logActivity";

const bookCategories = [
  { id: "FIC", name: "Fiction", subcategories: ["Literary", "Historical", "Sci-Fi", "Fantasy", "Mystery", "Romance", "Horror"] },
  { id: "NF", name: "Non-Fiction", subcategories: ["Biography", "History", "Science", "Philosophy", "Psychology", "Self-Help", "Business"] },
  { id: "SCI", name: "Science", subcategories: ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science"] },
  { id: "CS", name: "Computer Science", subcategories: ["Programming", "Web Dev", "Data Science", "AI", "Networking"] },
  { id: "CHI", name: "Children's", subcategories: ["Picture Books", "Early Readers", "Middle Grade", "Young Adult"] },
  { id: "REF", name: "Reference", subcategories: ["Encyclopedias", "Dictionaries", "Atlases", "Almanacs"] },
  { id: "ART", name: "Art & Culture", subcategories: ["Visual Arts", "Performing Arts", "Architecture", "Photography"] },
  { id: "REL", name: "Spirituality & Religion", subcategories: ["Religious Texts", "Theology", "Spirituality", "Mythology"] },
  { id: "TEC", name: "Technology", subcategories: ["Cybersecurity", "Mobile Dev", "Game Dev", "Robotics"] },
  { id: "SPO", name: "Sports & Recreation", subcategories: ["Sports", "Fitness", "Outdoor", "Games"] },
  { id: "MED", name: "Medicine", subcategories: ["Medical Textbooks", "Health", "Nursing", "Pharmacology"] },
  { id: "LAW", name: "Law", subcategories: ["Constitutional", "Criminal", "Corporate", "International"] }
];

const UpdateBook = ({ bookIdForUpdate, setActiveTab }) => {
  const context = useContext(myContext);
  const { getBooks } = context;
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("users"));
  const [isDragging, setIsDragging] = useState(false);
  const [base64, setBase64] = useState("");
  const navigate = useNavigate();

  //removable 

  const addBookToDB = () =>{}

   const [userInput, setUserInput] = useState({
      title : "",
      authorName : "",
      isbn : "",
      publicationYear : "",
      publisherName : "",
      description : "",
      category : "",
      shelfLocation : "",
      totalCopies : "",
      availableCopies : "",
      coverImage : "",
      userId : user?.uid
    })

    const handleCategoryChange = (e) =>{
        const selectedCategory = e.target.value;
        const shelf = bookCategories.filter((cat)=> cat.name === selectedCategory);
        const shelfLocation = shelf ? shelf[0]?.id : "";

        setUserInput({
            ...userInput,
            category : selectedCategory,
            shelfLocation : shelfLocation
        })
    }


    const processFile = (file) =>{
        if(!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setUserInput({
              ...userInput,
              coverImage : reader.result
            });
        };
        reader.readAsDataURL(file);
    }

    const handleFileChange = (e) =>{
        const file = e.target.files[0];
        processFile(file);
    }

    const handleDragEnter = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    const handleDragLeave = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    const handleDragOver = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        
    }

    const handleDrop = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;

        if(files && files.length > 0){
            const file = files[0];
            processFile(file);
        }
    }

    const getBookData = async () =>{
      try {
        const bookData = await getDoc(doc(fireDB, "book", bookIdForUpdate));
        const data = bookData.data();

        setUserInput({
          title : data?.title,
          authorName : data?.authorName,
          isbn : data?.isbn,
          publicatonYear : data?.publicatonYear,
          publisherName : data?.publisherName,
          description : data?.description,
          category : data?.category,
          shelfLocation : data?.shelfLocation,
          totalCopies : data?.totalCopies,
          availableCopies : data?.availableCopies,
          coverImage : data?.coverImage,
          createdAt : new Date(),
          date : new Date().toLocaleDateString(),
          time : new Date().toLocaleTimeString()
        })
      } catch (error) {
        console.log(error);
        toast.error("Error while getting the book details");
      }
    }

    const updateBookDetails = async () =>{
      if(!userInput.title || !userInput.authorName || !userInput.category || !userInput.totalCopies ||!userInput.shelfLocation || !userInput.coverImage){
            return toast.info("Please fill required fields");
          }
      try {
        await setDoc(doc(fireDB, "book", bookIdForUpdate), userInput);
        await logActivity({
          type : "updated",
          bookTitle : userInput?.title,
          userName : user?.name || "Staff",
          category : userInput.category
        });
        toast.success("Updated book details");
        
      } catch (error) {
        console.log(error);
        toast.error("Error while updating book");
      }
    }

    const discard = () =>{
      setActiveTab("catalog");
    }

    useEffect(()=> {
      getBookData();
    }, [])
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div
        onClick={() => setActiveTab("catalog")}
        className="flex items-center gap-x-2 cursor-pointer"
      >
        <BiLeftArrowAlt className="text-2xl" /> Back to Catalog
      </div>

      <div className="mt-4 leading-5">
        <span className="text-gray-500 text-sm">Catalog record {userInput?.shelfLocation}</span>
        <h1 className="text-2xl font-bold">Update book details</h1>
        <p className="text-gray-500 text-sm">
          Review and maintain the record for The Heaven & Earth Grocery Store.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Book Form */}
          <div className="bg-white rounded-lg shadow-lg mt-5 p-4">
            <h2 className="font-semibold text-[18px]">Book Details</h2>
            <p className="text-sm text-gray-500">
              Keep key bibliographic fields accurate for readers and staff.
            </p>

            <div className="flex flex-col mt-2">
              <label className="font-semibold">
                Title<span className="text-red-600"> *</span>
              </label>
              <input
                value={userInput.title}
                onChange={(e) =>
                  setUserInput({
                    ...userInput,
                    title: e.target.value,
                  })
                }
                className="p-2 mt-1 rounded-lg outline-0 border border-gray-500"
                type="text"
                placeholder="e.g., The Heaven & Grocery Store"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="">
                <label className="font-semibold">
                  Author <span className="text-red-700">*</span>
                </label>
                <input
                  value={userInput.authorName}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      authorName: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="First and last name"
                />
              </div>

              <div className="">
                <label className="font-semibold">ISBN</label>
                <input
                  value={userInput.isbn}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      isbn: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="971-0-000-000000-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="">
                <label className="font-semibold">Publication year</label>
                <input
                  value={userInput.publicatonYear}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      publicatonYear: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="2024"
                />
              </div>

              <div className="">
                <label className="font-semibold">Publisher</label>
                <input
                  value={userInput.publisherName}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      publisherName: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="Publisher name"
                />
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <label className="font-semibold">Description</label>
              <textarea
                value={userInput.description}
                onChange={(e) =>
                  setUserInput({
                    ...userInput,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="p-2 mt-1 rounded-lg outline-0 border border-gray-500"
                type="text"
                placeholder="Brief description for catalog search and staff reference"
              />
            </div>
          </div>

          {/* Collection and availability */}
          <div className="bg-white rounded-lg shadow-lg mt-5 p-4">
            <h2 className="font-semibold text-[18px]">
              Collection & availability
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="">
                <label className="font-semibold">
                  Category <span className="text-red-700">*</span>
                </label>
                <select
                  value={userInput?.category}
                  onChange={handleCategoryChange}
                  className="outline-0 w-full border border-gray-500 p-2 rounded-lg mt-1"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {bookCategories.map((book, index) => (
                    <option key={index}>{book.name}</option>
                  ))}
                </select>
              </div>

              <div className="">
                <label className="font-semibold">
                  Shelf Location <span className="text-red-700">*</span>
                </label>
                <input
                  value={userInput.shelfLocation}
                  onChange={handleCategoryChange}
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="e.g., FIC MCB"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="">
                <label className="font-semibold">
                  Total copies <span className="text-red-700">*</span>
                </label>
                <input
                  value={userInput.totalCopies}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      totalCopies: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="0"
                />
              </div>

              <div className="">
                <label className="font-semibold">Available copies</label>
                <input
                  value={userInput.availableCopies}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      availableCopies: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 outline-0 border border-gray-500 rounded-lg"
                  type="text"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="grid bg-white mt-5 p-4 rounded-lg">
          <h1 className="font-semibold mb-3">Cover image</h1>
         <div className="">
           <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-gray-200 p-3 rounded-lg "
          >
            {!userInput.coverImage ? (
              <div className="flex flex-col justify-center items-center gap-y-1">
                <IoImageOutline className="text-3xl" />
                <h2 className="font-semibold">Drop a cover here</h2>
                <span className="text-gray-600">JPG or PNG</span>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-white p-3 rounded-lg"
                >
                  Choose file{" "}
                </button>
                <input
                  ref={fileInputRef}
                  accept="image/jpeg,image/png, image/*"
                  onChange={handleFileChange}
                  type="file"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative w-full">
                <GiCrossMark
                  onClick={() => setUserInput({
                    ...userInput,
                    coverImage : ""
                  })}
                  className="absolute -right-3 -top-2 cursor-pointer text-lg text-red-600"
                />
                <img className="md:w-80" src={userInput?.coverImage} alt="" />
              </div>
            )}
          </div>

          {/* Ready to save */}
          <div className="bg-[#173b4d] text-white rounded-lg mt-5 p-3 leading-8">
            <h1 className="font-semibold">Save changes</h1>
            <p className="text-sm">
              The updated record will be visible across the library catalog.
            </p>
            <div className="flex flex-col gap-y-2 mt-3">
              <button
                onClick={updateBookDetails}
                className="bg-white font-semibold cursor-pointer text-[#1c2938] rounded-lg p-2"
              >
                Save updates
              </button>
              <button
                onClick={()=>discard()}
                className="border font-semibold cursor-pointer border-gray-500 rounded-lg p-2"
              >
                Discard changes
              </button>
            </div>
          </div>
         </div>

          {/* Archive or remove? */}

          <div className=" border border-[#d8d5ca] rounded-lg mt-5 p-2 leading-6 flex gap-x-2">
            <div>
                <PiWarningCircle className='text-[#b73c3c] text-3xl '/>
            </div>
            <div>
                <h2 className="font-semibold text-md">Archive or remove?</h2>
                <p className="text-[#616c6c]">Use the catalog actions to permanently delete a duplicate or withdrawn record.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBook;
