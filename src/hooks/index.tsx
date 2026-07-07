import { useEffect, useRef, useState } from "react";

type queryProps = string;

const useMediaQuery = (query: queryProps) => {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== match) {
      setMatch(media.matches);
    }
    const listener = () => {
      setMatch(media.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [match, query]);
  return match;
};

function useDropdown() {
  const dropdownRef = {
    about: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    neutral: useRef<HTMLDivElement>(null),
  };

  const [dropdowns, setDropdowns] = useState({
    about: false,
    services: false,
    neutral: false,
  });

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      let outSide = true;

      Object.entries(dropdownRef).forEach(([_, value]) => {
        if (value.current?.contains(event.target as Node)) {
          outSide = false;
        }
      });

      if (outSide) {
        setDropdowns({
          about: false,
          services: false,
          neutral: false,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);
    return () => document.removeEventListener("mousedown", handleClickOutSide);
  }, []);

  const closeDropDown = (dropdown: keyof typeof dropdowns) => {
    setDropdowns((prev) => ({ ...prev, [dropdown]: false }));
  };
  return { dropdownRef, dropdowns, setDropdowns, closeDropDown };
}

export default useDropdown;

export { useMediaQuery };
