const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const ProjectsList = ({ projects }) => {
  if (!projects?.length) {
    return <p className="mt-4">No projects yet.</p>;
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <details
          key={project.id}
          className="border border-black rounded-none p-3 bg-white/70"
        >
          <summary className="font-semibold break-words cursor-pointer">
            {project.title}
          </summary>

          <div className="mt-2 space-y-2 text-sm">
            {project.details && (
              <div
                className="break-words whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: project.details.replace(/\n/g, "<br />"),
                }}
              />
            )}
            <div className="text-xs text-gray-700 flex gap-3">
              <span>Status: {project.status || "active"}</span>
              {project.created_at && (
                <span>Created: {formatDate(project.created_at)}</span>
              )}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

export default ProjectsList;
