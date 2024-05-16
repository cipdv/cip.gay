import Link from "next/link";
import { getSession, logout } from "@/app/_actions";
import { redirect } from "next/navigation";
import Image from "next/image";

const Navbar = async () => {
  const currentUser = await getSession();

  return (
    <div className="pl-10 pt-6 pb-6 pr-10 bg-navbar flex justify-between">
      <Link href="/">
        <div className="flex items-center">
          <h1>Just for {currentUser?.resultObj?.firstName || "_______"}</h1>
        </div>
      </Link>
      {currentUser ? (
        <>
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
        </>
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
