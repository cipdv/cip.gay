import Link from "next/link";
import { getSession, logout } from "@/app/_actions";
import { redirect } from "next/navigation";
import Image from "next/image";

const Navbar = async () => {
  const currentUser = await getSession();

  return (
    <div className="pl-10 pt-6 pb-6 pr-10 bg-navbar flex justify-between items-center">
      <Link href="/">
        <div className="flex items-center">
          <h1>Just for {currentUser?.resultObj?.firstName || "_______"}</h1>
        </div>
      </Link>
      {currentUser ? (
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/to-do">
            <h3>To-do</h3>
          </Link>
          <Link href="/dashboard/ideas">
            <h3>Ideas</h3>
          </Link>
          <Link href="/dashboard/journal">
            <h3>Journal</h3>
          </Link>
          <Link href="/dashboard/projects">
            <h3>Projects</h3>
          </Link>
          <Link href="/dashboard/meals">
            <h3>Meals</h3>
          </Link>
          <Link href="/dashboard/watch-read-do">
            <h3>Watch/Read/Do</h3>
          </Link>
          <Link href="/dashboard/finances">
            <h3>Finances</h3>
          </Link>
          <Link href="/dashboard/memories">
            <h3>Memories</h3>
          </Link>
          <form
            action={async () => {
              "use server";
              await logout();
              redirect("/");
            }}
          >
            <button type="submit" className="btn whitespace-nowrap">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <Link href="/sign-in">
          <button className="btn whitespace-nowrap">Sign In</button>
        </Link>
      )}
    </div>
  );
};

export default Navbar;

// import { getSession, logout } from "@/app/_actions";
// import { redirect } from "next/navigation";

// import Link from "next/link";
// const Navbar = () => {
//   const session = getSession();
//   if (session) {
//     return (
//       <div className="pl-10 pt-6 pb-6 pr-10 bg-navbar flex justify-between">
//         <Link href="/">Home</Link>
//         {session ? (
//           <>
//             <form
//               action={async () => {
//                 "use server";
//                 await logout();
//                 redirect("/");
//               }}
//             >
//               <button type="submit" className="btn whitespace-nowrap">
//                 Sign out
//               </button>
//             </form>
//           </>
//         ) : (
//           <Link href="/signin">
//             <button className="btn whitespace-nowrap">Sign In</button>
//           </Link>
//         )}
//         ;
//       </div>
//     );
//   }
// };

// export default Navbar;
