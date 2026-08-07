import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const Loader = () => {
  return (
    <span className="animate-spin">
      <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} />
    </span>
  );
};

export default Loader;
