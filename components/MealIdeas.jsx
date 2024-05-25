import React from "react";

const MealIdeas = ({ ideas }) => {
  return (
    <div>
      {ideas.map((idea) => (
        <div
          key={idea?._id}
          className="bg-white bg-opacity-50 rounded p-2 space-y-3 mt-4"
        >
          <h3
            dangerouslySetInnerHTML={{
              __html: idea?.idea ? idea.idea.replace(/\n/g, "<br />") : "",
            }}
          />
          <p
            className="mt-4"
            dangerouslySetInnerHTML={{
              __html: idea?.notes ? idea.notes.replace(/\n/g, "<br />") : "",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default MealIdeas;
