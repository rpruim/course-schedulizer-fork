import { IconButton, Typography } from "@material-ui/core";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import React, { useContext } from "react";
import { enumArray } from "../../../utilities/helpers/utils";
import { useThunk } from "../../../utilities/hooks/useThunk";
import { Term } from "../../../utilities/interfaces/dataInterfaces";
import { AppContext } from "../../../utilities/services/appContext";
import "./SemesterSelector.scss";

export const SemesterSelector = () => {
  const terms: Term[] = enumArray(Term);
  const {
    appState: { selectedTerm },
    appDispatch,
    setIsLoading,
  } = useContext(AppContext);
  const thunkDispatch = useThunk(appDispatch);

  const handleOnClick = (index: number) => {
    // TODO: add another loading state for when the Schedule is updating.
    return () => {
      setIsLoading(true);
      const newTerm = terms[index];
      // This action takes so long it affectively makes this
      //  synchronous function asynchronous.
      thunkDispatch({
        payload: { term: newTerm },
        type: "setSelectedTerm",
      }).then(() => {
        return setIsLoading(false);
      });
    };
  };

  return (
    <div className="semester-selector">
      <IconButton
        disabled={selectedTerm === terms[0]}
        onClick={handleOnClick(terms.indexOf(selectedTerm) - 1)}
      >
        <ChevronLeft />
      </IconButton>
      <Typography variant="h6">{selectedTerm}</Typography>
      <IconButton
        disabled={selectedTerm === terms[terms.length - 1]}
        onClick={handleOnClick(terms.indexOf(selectedTerm) + 1)}
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
};
