import React from "react";
import { Box } from "@material-ui/core";
import { ImportButton } from "../CSVActions/ImportButton";
import { AddSectionButton } from "../../../reuseables/AddSectionButton";
import "./NoCoursesHeader.scss";

/* Display information when schedule has no courses. */
export const NoCoursesHeader = () => {
  return (
    <>
      <h2>No schedule data.</h2>
      <p>
        Please import a CSV of an existing schedule or start building the schedule from scratch by
        adding your first section.
      </p>
      <Box component="span" marginRight={1}>
        <ImportButton variant="contained" />
      </Box>
      <AddSectionButton isIcon={false} />
    </>
  );
};
