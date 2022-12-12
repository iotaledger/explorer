import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import NetworkContext from "../../context/NetworkContext";

interface InputProps {

}

const Input: React.FC<InputProps> = () => {
    const history = useHistory();
    const { tokenInfo } = useContext(NetworkContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormattedBalance, setIsFormattedBalance] = useState(true);

  return (
      <div />
  );
};

export default Input;
