import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Grid, InputAdornment, Typography } from "@material-ui/core";
import { GridItemCheckboxGroup, GridItemRadioGroup, GridItemTextField } from "components";
import moment from "moment";
import React, { ChangeEvent, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import {
  convertFromSemesterLength,
  schema,
  SectionInput,
  updateScheduleWithNewSection,
} from "utilities";
import { AppContext } from "utilities/contexts";
import {
  CourseSectionMeeting,
  Day,
  Half,
  Intensive,
  SemesterLength,
  SemesterLengthOption,
  Term,
  Weekday,
} from "utilities/interfaces";
import "./AddSectionPopover.scss";

interface AddSectionPopover {
  values?: CourseSectionMeeting;
}
const SPACING = 2;

/* A form to input information to add a schedule */
export const AddSectionPopover = ({ values }: AddSectionPopover) => {
  const {
    appState: { schedule },
    appDispatch,
    setIsCSVLoading,
  } = useContext(AppContext);
  const { register, handleSubmit, control } = useForm<SectionInput>({
    resolver: yupResolver(schema),
  });
  const [semesterLength, setSemesterLength] = useState<SemesterLengthOption>(
    convertFromSemesterLength(values?.section.semesterLength).toLowerCase() as SemesterLengthOption,
  );

  // handlers
  const onSubmit = (data: SectionInput) => {
    setIsCSVLoading(true);
    updateScheduleWithNewSection(data, schedule);
    appDispatch({ payload: { schedule }, type: "setScheduleData" });
    setIsCSVLoading(false);
  };
  const onSemesterLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSemesterLength(e.target.value as SemesterLengthOption);
  };

  const isHalfSemester = semesterLength === SemesterLengthOption.HalfSemester;
  const isIntensiveSemester = semesterLength === SemesterLengthOption.IntensiveSemester;
  const isCustomSemester = semesterLength === SemesterLengthOption.CustomSemester;

  const locationValue =
    (values && `${values?.meeting.location.building} ${values?.meeting.location.roomNumber}`) || "";

  // TODO: Make fields for department, termStart, used, day10Used, startDate, endDate, status, and/or instructionalMethod?
  return (
    <form className="popover-container">
      <Box mb={SPACING}>
        <Typography className="popover-title" variant="h4">
          Add Section
        </Typography>
      </Box>
      <Grid container spacing={SPACING}>
        {/* TODO: Dropdown for courses already in system */}
        <GridItemTextField
          label="Prefix"
          register={register}
          textFieldProps={{ autoFocus: true }}
          value={values?.course.prefixes.join()}
        />
        <GridItemTextField label="Number" register={register} value={values?.course.number} />
        <GridItemTextField label="Section" register={register} value={values?.section.letter} />
        <GridItemTextField label="Name" register={register} value={values?.course.name} />
        <Grid item xs>
          <span>{/* TODO: add error messages? */}</span>
        </Grid>
      </Grid>
      <Grid container spacing={SPACING}>
        {/* TODO: Dropdown for instructors with option to add new one */}
        <GridItemTextField
          label="Instructor"
          register={register}
          value={values?.section.instructors.join()}
        />
        {/* TODO: Dropdown for rooms with option to add new one */}
        <GridItemTextField label="Location" register={register} value={locationValue} />
        <GridItemTextField
          label="Room Capacity"
          register={register}
          textFieldProps={{ name: "roomCapacity" }}
          value={(values?.meeting.location.roomCapacity || "").toString()}
        />
        <GridItemTextField
          label="Faculty Hours"
          register={register}
          textFieldProps={{ name: "facultyHours" }}
          value={(values?.section.facultyHours || values?.course.facultyHours || "").toString()}
        />
        <GridItemTextField
          label="Student Hours"
          register={register}
          textFieldProps={{ name: "studentHours" }}
          value={(values?.section.studentHours || values?.course.studentHours || "").toString()}
        />
      </Grid>
      <Grid container spacing={SPACING}>
        <GridItemTextField
          label="Anticipated Size"
          register={register}
          textFieldProps={{ name: "anticipatedSize" }}
          value={(values?.section.anticipatedSize || "").toString()}
        />
        <GridItemTextField
          label="Local Max"
          register={register}
          textFieldProps={{ name: "localMax" }}
          value={(values?.section.localMax || "").toString()}
        />
        <GridItemTextField
          label="Global Max"
          register={register}
          textFieldProps={{ name: "globalMax" }}
          value={(values?.section.globalMax || "").toString()}
        />
        <GridItemTextField
          label="Start Time"
          register={register}
          textFieldProps={{ fullWidth: true, name: "startTime", type: "time" }}
          value={
            values?.meeting.startTime
              ? moment(values?.meeting.startTime, "h:mma").format("HH:mm")
              : "08:00"
          }
        />
        <GridItemTextField
          label="Duration"
          register={register}
          textFieldProps={{
            InputProps: {
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
            },
          }}
          value={(values?.meeting.duration || "").toString()}
        />
      </Grid>
      <Grid container spacing={SPACING}>
        <GridItemCheckboxGroup
          label="Days"
          options={Object.values(Day).filter((day) => {
            return Object.values(Weekday).includes(day);
          })}
          register={register}
          value={values?.meeting.days}
        />
        <GridItemRadioGroup
          control={control}
          defaultValue={values?.section.term || Term.Fall}
          label="Term"
          options={Object.values(Term)}
          register={register}
        />
        <GridItemRadioGroup
          control={control}
          defaultValue={convertFromSemesterLength(values?.section.semesterLength)}
          label="Semester Length"
          onChange={onSemesterLengthChange}
          options={Object.values(SemesterLengthOption)}
          register={register}
        />
        <Grid item xs>
          {isHalfSemester && (
            <GridItemRadioGroup
              control={control}
              defaultValue={values?.section.semesterLength || SemesterLength.HalfFirst}
              label="Half Semester"
              lowercase
              name="half"
              options={Object.values(SemesterLength).filter((h) => {
                return Object.values(Half).includes(h);
              })}
              register={register}
            />
          )}
          {isIntensiveSemester && (
            <GridItemRadioGroup
              control={control}
              defaultValue={values?.section.semesterLength || SemesterLength.IntensiveA}
              label="Intensive Semester"
              name="intensive"
              options={Object.values(SemesterLength).filter((i) => {
                return Object.values(Intensive).includes(i);
              })}
              register={register}
            />
          )}
          {isCustomSemester && (
            <Grid container direction="column" spacing={SPACING}>
              {/* TODO: add support for custom */}
              <GridItemTextField
                label="Start Date"
                register={register}
                textFieldProps={{
                  defaultValue: "2020-20-20",
                  disabled: true,
                  fullWidth: true,
                  // type: "date",
                }}
              />
              <GridItemTextField
                label="End Date"
                register={register}
                textFieldProps={{
                  defaultValue: "2020-20-20",
                  disabled: true,
                  // type: "date",
                }}
              />
              <Typography variant="caption">
                Custom semester lengths are not support yet.
              </Typography>
            </Grid>
          )}
        </Grid>
        <GridItemTextField
          label="Notes"
          register={register}
          textFieldProps={{ multiline: true, name: "comments", rows: 4 }}
          value={values?.section.comments}
        />
      </Grid>
      <Grid alignItems="flex-end" container justify="space-between">
        <Grid item>
          <Typography variant="caption">
            Tip: use <b>tab</b> and <b>shift + tab</b> to navigate, <b>space bar</b> to select days,{" "}
            <b>arrow keys</b> to select term and others, and <b>return</b> to submit.
          </Typography>
        </Grid>
        <Grid item>
          <Button color="primary" onClick={handleSubmit(onSubmit)} variant="contained">
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

AddSectionPopover.defaultProps = {
  values: undefined,
};