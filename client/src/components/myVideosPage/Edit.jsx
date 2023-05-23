import React, { useEffect, useState } from "react";
import { getById, updateVideo, deleteVideo } from "../../services/nodeApi";
import { options } from "../../constants";
import { useAuth } from "../../contextApi/appContext";
import { toast } from "react-toastify";

const Edit = ({ selectedVideo }) => {
  const [openDropdown, setOpenDropdown] = useState({});
  const [video, setVideo] = useState({});
  const [auth] = useAuth();
  const userId = auth.user._id;
  const videoId = selectedVideo || auth.user.myVideos[0];

  const successMessage = (message) => toast.success(message);
  const errorMessage = (message) => toast.error(message);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    visibility: "",
  });

  const [dropdownValues, setDropdownValues] = useState({
    Category: "",
    Visibility: "",
  });

  const handleInputChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleDropdown = (title) => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [title]: !prevState[title],
    }));
  };
  const handleDropdownSelection = (option, item) => {
    setDropdownValues((prevValues) => ({
      ...prevValues,
      [option]: item,
    }));
    setFormData((prevFormData) => ({
      ...prevFormData,
      [option.toLowerCase()]: item,
    }));
    toggleDropdown(option);
  };

  useEffect(() => {
    const getVideo = async (videoId) => {
      if (!videoId || !userId) {
        return <p className="text-center font-extrabold text-4xl">User has no videos to edit</p>
      }
      try {
        const result = await getById(videoId);
        setVideo(result);
        setFormData({
          title: result.title,
          description: result.description,
          category: result.category,
          visibility: result.visibility,
        });
        setDropdownValues({
          Category: result.category,
          Visibility: result.visibility,
        });
      } catch (err) {
        errorMessage(err.message);
      }
    };
    getVideo(videoId);
  }, [videoId, userId]);

  const submitForm = async (e) => {
    e.preventDefault();
    const videoData = new FormData();
    videoData.append("title", formData.title);
    videoData.append("category", formData.category);
    videoData.append("description", formData.description);
    videoData.append("visibility", formData.visibility);
    try {
      const result = await updateVideo(userId, videoId, formData);
      successMessage(result);
    } catch (error) {
      errorMessage(error.message);
    }
  };

  const handleDeleteButton = async () => {
    try {
      const result = await deleteVideo(userId, videoId);
      successMessage(result);
    } catch (err) {
      errorMessage(err.message);
    }
  };

  return (
    <div className="w-1/2 bg-[#0F121FF5]">
      {!videoId || !userId ? (
        <p className="text-center font-extrabold text-4xl">User has no videos to edit</p>
      ) : (
        <div>
          <div className=" min-w-full aspect-w-16 h-48">
            <video src={video.video} className="w-full h-full object-cover" />
          </div>
          <form
            action="#"
            method="POST"
            onSubmit={submitForm}
            encType="application/json"
          >
            <div className="flex justify-between p-2">
              <div
                style={{
                  maxWidth: "50%",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <input
                  name="title"
                  type="text"
                  className=" text-xl font-bold bg-[#0F121FF5] text-white max-w-fit focus:outline-none"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-baseline">
                <div className="ml-2 text-gray-200 text-xs mt-1">
                  {video.date}
                </div>
                <div className="ml-2 text-gray-200 text-xs px-1 py">
                  {video.duration} Mins
                </div>
                <div className="ml-2 text-gray-200 text-xs mt-1 mr-3 ">
                  {video.views} Views
                </div>
              </div>
            </div>
            <hr className=" mx-2 border-gray-700" />
            <div className=" py-1 px-2">
              <p className="text-white py-1">Description</p>
              <textarea
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="focus:outline-none bg-[#0F121FF5] min-w-full text-white h-16 placeholder:text-sm placeholder:text-gray-500"
                placeholder="Description"
              />
            </div>
            <hr className=" mx-2 border-gray-700" />
            <div className="flex justify-around py-3">
              {options.map((option) => (
                <div key={option.title}>
                  <p className="text-xs text-gray-500 pl-6">{option.title}</p>
                  <button
                    id="dropdownDefaultButton"
                    data-dropdown-toggle="dropdown"
                    className="text-white focus:outline-none font-medium rounded-lg text-sm px-4 pb-2.5 pt-1 text-center inline-flex items-center"
                    type="button"
                    onClick={() => toggleDropdown(option.title)}
                  >
                    {dropdownValues[option.title] || option.title}
                    <svg
                      className="w-4 h-4 ml-2"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {openDropdown[option.title] && option.list && (
                    <div
                      id="dropdown"
                      className="z-50 absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                    >
                      <ul
                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                        aria-labelledby="dropdownDefaultButton"
                      >
                        {option.list.map((item) => (
                          <li key={item}>
                            <p
                              className="block px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                              onClick={() => {
                                handleDropdownSelection(option.title, item);
                              }}
                            >
                              {item}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <hr className=" mx-2 border-gray-700" />
            <div className=" mt-10 mb-3 h-fit flex justify-between">
              <button
                className=" mx-4 mt-6 hover:bg-red-800 text-white font-bold py-2 px-12 bg-red-500 rounded-[28px]"
                onClick={handleDeleteButton}
              >
                Delete
              </button>
              <button
                type="submit"
                className=" mt-6 mx-4 text-white font-bold py-2 px-12 bg-[#C4B4F8] hover:bg-violet-500 rounded-[28px]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Edit;
