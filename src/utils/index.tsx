import { NavigateFunction } from "react-router-dom";
import { UserType } from "./enums";

export const handleNavigate = (role: string, navigate: NavigateFunction) => {
  switch (role) {
    case UserType.CASE_MANAGER:
      navigate("/case-manager");

      break;
    case UserType.CENTER_REGISTRAR:
      navigate("/center-registrar");
      break;
    case UserType.DIRECTOR:
      navigate("/director");
      break;
    case UserType.MEDIATOR:
      navigate("/mediator");
      break;
    case UserType.HEAD_ADR_OPERATIONS:
      navigate("/head-of-adr-operations");
      break;
    case UserType.HEAD_NEUTRAL_PROG_TRAINING:
      navigate("/head-of-neutral-prog-training");
      break;
    case UserType.INDIVIDUAL:
      navigate("/individual");
      break;
    case UserType.LAWYER:
      navigate("/lawyer");
      break;
    case UserType.MENTEE:
      navigate("/mentee");
      break;
    default:
      navigate("/lawyer");
      break;
  }
};
