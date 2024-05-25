import React from "react";

const ToWatchReadDo = ({ ideas }) => {
  const watchIdeas = ideas.filter((idea) => idea.type === "watch");
  const readIdeas = ideas.filter((idea) => idea.type === "read");
  const doIdeas = ideas.filter((idea) => idea.type === "do");

  return (
    <div>
      <h2 className="mt-4">Watch</h2>
      {watchIdeas.map((idea) => (
        <div
          key={idea?._id}
          className="bg-white bg-opacity-50 rounded p-2 space-y-3 mt-4"
        >
          <p
            className="mt-1"
            dangerouslySetInnerHTML={{
              __html: idea?.notes ? idea.notes.replace(/\n/g, "<br />") : "",
            }}
          />
        </div>
      ))}

      <h2 className="mt-4">Read</h2>
      {readIdeas.map((idea) => (
        <div
          key={idea?._id}
          className="bg-white bg-opacity-50 rounded p-2 space-y-3 mt-4"
        >
          <p
            className="mt-1"
            dangerouslySetInnerHTML={{
              __html: idea?.notes ? idea.notes.replace(/\n/g, "<br />") : "",
            }}
          />
        </div>
      ))}

      <h2 className="mt-4">Do</h2>
      {doIdeas.map((idea) => (
        <div
          key={idea?._id}
          className="bg-white bg-opacity-50 rounded p-2 space-y-3 mt-4"
        >
          <p
            className="mt-1"
            dangerouslySetInnerHTML={{
              __html: idea?.notes ? idea.notes.replace(/\n/g, "<br />") : "",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ToWatchReadDo;
