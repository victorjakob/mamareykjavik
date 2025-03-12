import { PropagateLoader } from "react-spinners";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <PropagateLoader color="#F97316" size={11} aria-hidden="true" />
    </div>
  );
}
