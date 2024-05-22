import DashboardLinks from "@/components/DashboardLinks";
import React from "react";
import Goals from "@/components/Goals";
import Upcoming from "@/components/Upcoming";
import Quotes from "@/components/Quotes";
import Notes from "@/components/Notes";

const dashboardPage = () => {
  return (
    <section>
      <div className="m-8">
        <Quotes />
      </div>
      <div className="m-8">
        <Notes />
      </div>
      <div className="grid grid-cols-2 gap-2 m-8">
        <Goals />
        <DashboardLinks />
      </div>
      <div className="m-8">
        <Upcoming />
      </div>
    </section>
  );
};

export default dashboardPage;
