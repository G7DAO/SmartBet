import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Connect = () => {
  const location = useLocation().pathname;
  const pathname = location.slice(0, location.length - 2);

  return (
    <div
      className={`w-[48rem] flex items-center ${
        pathname === "/session" ? "justify-between" : "justify-end"
      } mb-2`}
    >
      {pathname === "/session" ? (
        <Link to={"/"}>
          <div className="bg-prime-purple py-2 px-4">Home</div>
        </Link>
      ) : (
        ""
      )}
      <ConnectButton accountStatus="address" label="Connect"></ConnectButton>
    </div>
  );
};

export default Connect;
