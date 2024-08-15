import React from "react";

const VideoTitle = ({ title, overview }) => {
  return (
    <div className="w-screen aspect-video pt-[20%] px-24 absolute text-white bg-gradient-to-r from-black">
      <h1 className="text-6xl font-bold">{title}</h1>
      <p className="py-6 text-lg w-1/4">{overview}</p>
      <div className="flex gap-4 mt-5">
        <button className="flex items-center bg-white text-black p-4 px-8 text-lg font-bold rounded-lg shadow-md hover:bg-gray-200 transition-all">
          <span className="text-2xl">&#9654;</span>
          <span className="ml-2">Play</span>
        </button>
        <button className="flex items-center bg-gray-600 text-white p-4 px-8 text-lg font-bold rounded-lg shadow-md hover:bg-gray-700 transition-all">
          <span className="text-2xl">&#9432;</span>
          <span className="ml-2">More Info</span>
        </button>
      </div>
    </div>
  );
};

export default VideoTitle;
