import { Atom } from "react-loading-indicators";

export default function Loader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Atom color="#474947" size="medium" text="" textColor="" />
    </div>
  );
}
