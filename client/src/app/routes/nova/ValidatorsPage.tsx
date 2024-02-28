import React from "react";
import { useValidators } from "~/helpers/nova/hooks/useValidators";
import "./ValidatorsPage.scss";

const ValidatorsPage: React.FC = () => {
    const { validators } = useValidators();

    return JSON.stringify(validators);
};

export default ValidatorsPage;
