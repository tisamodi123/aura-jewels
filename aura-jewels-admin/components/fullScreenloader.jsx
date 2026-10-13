//** Third party imports */
import { Loader } from "lucide-react";

const FullScreenLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-xs z-80">
            <Loader className="animate-spin text-blue-500" size={48} />
        </div>
    );
};

export default FullScreenLoader;
