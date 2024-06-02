import {
  PiFolderUserDuotone,
  PiGlobeSimpleDuotone,
  PiMagnifyingGlassDuotone,
  PiGoogleLogoDuotone,
} from "react-icons/pi";

import Spinner from "../animation/spinner"
import LoadingDots from "../animation/loadingDots";
import linkify from "../../utils/linkify.js";

export const renderBasedOnResponseStatus = (status) => {
  switch (status[0]) {
    case "ChatGPT":
      return (
        <div className="border border-purple-500/75 border-1 flex rounded-lg justify-center items-center max-w-fit">
          <div className="flex">
            <PiGlobeSimpleDuotone className="w-6 h-6 mx-4 my-2 text-purple-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">Browsing...</span>
              </div>
              <Spinner
                className=""
                size={`w-3 h-3`}
                tintColor={"fill-black"}
                bgColor={"dark:text-purple-300"}
              />
            </div>
            <div className="text-gray text-xs font-medium mr-2">
              {status[0]}
            </div>
          </div>
        </div>
      );
    case "Google_Search":
      return (
        <div className="border border-red-500/75 border-1 flex rounded-lg justify-center items-center max-w-fit">
          <div className="flex">
            <PiGoogleLogoDuotone className="w-6 h-6 mx-4 my-2 text-red-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">Browsing...</span>
              </div>
              <Spinner
                className=""
                size={`w-3 h-3`}
                tintColor={"fill-black"}
                bgColor={"dark:text-red-300"}
              />
            </div>
            <div className="text-gray text-xs font-medium mr-2">
              {status[0]}
            </div>
          </div>
        </div>
      );
    case "Document_QA_System":
      return (
        <div className="border border-blue-500/75 border-1 flex rounded-lg justify-center items-center max-w-fit">
          <div className="flex">
            <PiFolderUserDuotone className="w-6 h-6 mx-4 my-2 text-blue-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">Browsing...</span>
              </div>
              <Spinner
                className=""
                size={`w-3 h-3`}
                tintColor={"fill-black"}
                bgColor={"dark:text-blue-300"}
              />
            </div>
            <div className="text-gray text-xs font-medium mr-2">
              Your documents
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="mt-4">
          <LoadingDots />
        </div>
      );
  }
};

export const renderBasedOnSource = (sourceStatus) => {
  switch (sourceStatus) {
    case "ChatGPT":
      return (
        <div className="flex rounded-lg justify-center items-center max-w-fit bg-white rounded-md">
          <div className="flex">
            <PiGlobeSimpleDuotone className="w-6 h-6 mx-4 my-2 text-purple-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">ChatGPT</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "Google_Search":
      return (
        <div className="flex rounded-lg justify-center items-center max-w-fit bg-white rounded-md">
          <div className="flex">
            <PiGoogleLogoDuotone className="w-6 h-6 mx-4 my-2 text-red-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">Google Search</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "Document_QA_System":
      return (
        <div className="flex rounded-lg justify-center items-center max-w-fit">
          <div className="flex">
            <PiFolderUserDuotone className="w-6 h-6 mx-4 my-2 text-blue-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">Document Library</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "Document_Display":
      return (
        <div className="flex rounded-lg justify-center items-center max-w-fit">
          <div className="flex">
            <PiMagnifyingGlassDuotone className="w-6 h-6 mx-4 my-2 text-blue-500" />
          </div>
          <div className="my-2 mr-5">
            <div className="flex items-center">
              <div className="text-gray text-xs font-bold flex aligns-center">
                <span className="mr-2">Document Search</span>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return <></>;
  }
};

export function markdownToHtml(str) {
  // Convert bold text
  str = str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert code blocks with syntax highlighting
  str = str.replace(/```(.*?)\n(.*?)```/gs, function (match, lang, code) {
    const highlightedCode = hljs.highlight(lang, code).value;
    return `<pre><code class="hljs ${lang}">${highlightedCode}</code></pre>`;
  });

  str = linkify(str);

  return str;
}
