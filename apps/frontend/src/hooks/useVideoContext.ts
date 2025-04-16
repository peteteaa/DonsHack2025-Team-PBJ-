import { useContext } from "react";
import { VideoContext } from "../context/VideoContext";
import type { VideoContextProps } from "../context/VideoContext";

// Custom hook for consuming the VideoContext
export const useVideoContext = (): VideoContextProps => {
	const context = useContext(VideoContext);
	if (!context) {
		throw new Error("useVideoContext must be used within a VideoProvider");
	}
	return context;
};
