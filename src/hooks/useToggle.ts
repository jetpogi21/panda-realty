import { useState } from "react";

export const useToggle = () => {
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => setToggle(!toggle);
  const handleShow = () => setToggle(true);
  const handleHide = () => setToggle(false);

  return {
    handleToggle,
    handleShow,
    handleHide,
    toggle,
  };
};
