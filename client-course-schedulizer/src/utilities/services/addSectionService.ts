import { filter, indexOf, isEqual, map } from "lodash";
import moment from "moment";
import { CheckboxTerms } from "utilities";
import { locationCase, startTimeCase, yearCase } from "utilities/helpers";
import {
  Course,
  CourseSectionMeeting,
  Day,
  Half,
  Instructor,
  Intensive,
  Location,
  Meeting,
  Prefix,
  Schedule,
  Section,
  SemesterLength,
  SemesterLengthOption,
  Term,
  Weekday,
} from "utilities/interfaces";

type CheckboxDays = (Day | boolean)[];

// Defines interface for the section popover input
export interface SectionInput {
  anticipatedSize?: Section["anticipatedSize"];
  comments?: Section["comments"];
  day10Used?: Section["day10Used"];
  days: CheckboxDays;
  department?: Course["department"];
  duration?: Meeting["duration"];
  facultyHours?: Section["facultyHours"];
  globalMax?: Section["globalMax"];
  halfSemester?: Half;
  instructionalMethod?: Section["instructionalMethod"];
  instructor: Instructor[];
  intensiveSemester?: Intensive;
  localMax?: Section["localMax"];
  location: string;
  name: Course["name"];
  number: Course["number"];
  prefix: Prefix[];
  roomCapacity?: Location["roomCapacity"];
  section: Section["letter"];
  semesterLength: SemesterLengthOption;
  startTime: Meeting["startTime"];
  status?: Section["status"];
  studentHours?: Section["studentHours"];
  term: Section["term"];
  used?: Section["used"];
  year: string; // Assume string till yearCase() decides
}

export interface NonTeachingLoadInput {
  activity: Section["instructionalMethod"];
  facultyHours?: Section["facultyHours"];
  instructor: Instructor;
  terms: CheckboxTerms;
}

export const convertFromSemesterLength = (sl: SemesterLength | undefined): SemesterLengthOption => {
  if (sl === SemesterLength.Full || !sl) {
    return SemesterLengthOption.FullSemester;
  }
  if (sl === SemesterLength.HalfFirst || sl === SemesterLength.HalfSecond) {
    return SemesterLengthOption.HalfSemester;
  }

  return SemesterLengthOption.IntensiveSemester;
};

const convertToSemesterLength = (sl: Half | Intensive | SemesterLengthOption): SemesterLength => {
  switch (sl) {
    case Half.First:
      return SemesterLength.HalfFirst;
    case Half.Second:
      return SemesterLength.HalfSecond;
    case Intensive.A:
      return SemesterLength.IntensiveA;
    case Intensive.B:
      return SemesterLength.IntensiveB;
    case Intensive.C:
      return SemesterLength.IntensiveC;
    case Intensive.D:
      return SemesterLength.IntensiveD;
    default:
      return SemesterLength.Full;
  }
};

export const getSectionName = (course: Course, section: Section) => {
  return `${course.prefixes[0]}-${course.number}-${section.letter}`;
};

export const getCourse = (
  schedule: Schedule,
  prefixes: Course["prefixes"],
  courseNumber: Course["number"],
) => {
  const courses = filter(schedule.courses, (course) => {
    return isEqual(course.prefixes, prefixes) && course.number === courseNumber;
  });
  return courses.length > 0 ? courses[0] : undefined;
};

export const getSection = (
  schedule: Schedule,
  prefixes: Course["prefixes"],
  courseNumber: Course["number"],
  letter: Section["letter"],
  term: Section["term"],
  instructors: Section["instructors"],
  instructionalMethod: Section["instructionalMethod"],
) => {
  const course = getCourse(schedule, prefixes, courseNumber);
  const sections = filter(course?.sections, (section) => {
    return (
      section.letter === letter &&
      section.term === term &&
      isEqual(section.instructors, instructors) &&
      section.instructionalMethod === instructionalMethod
    );
  });
  return sections.length > 0 ? sections[0] : undefined;
};

const removeSection = (
  schedule: Schedule,
  letter: Section["letter"],
  term: Section["term"],
  instructors: Section["instructors"],
  courseIndex: number,
) => {
  schedule.courses[courseIndex].sections = filter(
    schedule.courses[courseIndex].sections,
    (section) => {
      return (
        section.letter !== letter || section.term !== term || section.instructors !== instructors
      );
    },
  );
  // TODO: Delete course if no sections left?
};

/* Used to map the input from the popover form to the
 internal JSON object type.  */
export const mapInputToInternalTypes = (data: SectionInput) => {
  const newSection: Section = createNewSectionFromInput(data);
  const newCourse: Course = createNewCourseFromInput(data);

  return { newCourse, newSection };
};

export const mapInternalTypesToInput = (data?: CourseSectionMeeting): SectionInput => {
  const locationValue = (
    (data &&
      data.meeting &&
      `${data?.meeting?.location.building} ${data?.meeting?.location.roomNumber}`) ||
    ""
  ).trim();
  console.log(data?.section.facultyHours);
  let defaultTerm = data?.section.term;
  if (Array.isArray(defaultTerm)) {
    [defaultTerm] = defaultTerm;
  }

  const days = addFalseToDaysCheckboxList(data?.meeting?.days);

  return {
    anticipatedSize: data?.section.anticipatedSize,
    comments: data?.section.comments,
    day10Used: data?.section.day10Used,
    days,
    department: data?.course.department,
    duration: data?.meeting?.duration,
    facultyHours:
      data?.section.facultyHours !== undefined && data.section.facultyHours > -1
        ? data.section.facultyHours
        : undefined,
    globalMax: data?.section.globalMax,
    halfSemester: ((data?.section.semesterLength &&
    convertFromSemesterLength(data?.section.semesterLength) === SemesterLengthOption.HalfSemester
      ? data?.section.semesterLength
      : SemesterLength.HalfFirst) as unknown) as Half,
    instructionalMethod: data?.section.instructionalMethod ?? "LEC",
    instructor: data?.section.instructors ?? [],
    intensiveSemester: ((data?.section.semesterLength &&
    convertFromSemesterLength(data?.section.semesterLength) ===
      SemesterLengthOption.IntensiveSemester
      ? data?.section.semesterLength
      : SemesterLength.IntensiveA) as unknown) as Intensive,
    localMax: data?.section.localMax,
    location: locationValue,
    name: data?.section.name ?? data?.course.name ?? "",
    number: data?.course.number ?? "",
    prefix: data?.course.prefixes ?? [],
    roomCapacity: data?.meeting?.location.roomCapacity,
    section: data?.section.letter ?? "",
    semesterLength: convertFromSemesterLength(data?.section.semesterLength),
    startTime: data?.meeting?.startTime
      ? moment(data?.meeting?.startTime, "h:mm A").format("HH:mm")
      : "08:00",
    status: data?.section.status ?? "Active",
    studentHours:
      data?.section.studentHours !== undefined && data.section.studentHours > -1
        ? data.section.studentHours
        : undefined,
    term: defaultTerm || Term.Fall,
    used: data?.section.used,
    year: data?.section.year?.toString() ?? "",
  };
};

const createNewSectionFromInput = (data: SectionInput): Section => {
  const location = locationCase(data.location);
  const semesterType = convertToSemesterLength(
    data.intensiveSemester || data.halfSemester || data.semesterLength,
  );

  const building = location[0];
  const roomNumber = location[1];

  return {
    anticipatedSize: data.anticipatedSize ? Number(data.anticipatedSize) : undefined,
    comments: data.comments,
    day10Used: data.day10Used ? Number(data.day10Used) : undefined,
    endDate: "",
    facultyHours: Number(data.facultyHours),
    globalMax: data.globalMax ? Number(data.globalMax) : undefined,
    instructionalMethod: data.instructionalMethod,
    instructors: data.instructor,
    letter: data.section,
    localMax: data.localMax ? Number(data.localMax) : undefined,
    meetings: [
      {
        days: data.days as Day[],
        duration: Number(data.duration),
        location: {
          building,
          roomCapacity: Number(data.roomCapacity),
          roomNumber,
        },
        startTime: startTimeCase(data.startTime),
      },
    ],
    semesterLength: semesterType,
    startDate: "",
    status: data.status,
    studentHours: Number(data.studentHours),
    term: data.term,
    termStart: "",
    used: data.used ? Number(data.used) : undefined,
    year: yearCase(data.year),
  };
};

const createNewCourseFromInput = (data: SectionInput): Course => {
  return {
    department: data.department,
    name: data.name,
    number: data.number,
    prefixes: data.prefix,
    // The newSection will be added later in insertSectionCourse()
    sections: [],
  };
};

// If there is an old version of the Section...
export const handleOldSection = (
  oldData: CourseSectionMeeting | undefined,
  newSection: Section,
  removeOldSection: boolean,
  schedule: Schedule,
) => {
  const oldSection = oldData?.section;
  if (oldSection) {
    // If the year, term, and semester length haven't changed...
    if (
      String(newSection.year) === String(oldSection.year) &&
      newSection.term === oldSection.term &&
      newSection.semesterLength === oldSection.semesterLength
    ) {
      // Update the new Section to match the date fields of the old Section
      newSection.termStart = oldSection.termStart;
      newSection.startDate = oldSection.startDate;
      newSection.endDate = oldSection.endDate;
    }

    // Remove the old version of the Section
    if (removeOldSection) {
      removeSectionFromSchedule(oldData, schedule, oldSection);
    }
  }
};

export const removeSectionFromSchedule = (
  data: CourseSectionMeeting | undefined,
  schedule: Schedule,
  section: Section,
) => {
  const oldCourse = data?.course;
  const courseIndex = indexOf(schedule.courses, oldCourse);
  removeSection(schedule, section.letter, section.term, section.instructors, courseIndex);
};

export const addFalseToDaysCheckboxList = (days?: Day[]): CheckboxDays => {
  const weekdays = Object.values(Day).filter((day) => {
    return Object.values(Weekday).includes(day);
  });

  if (!days) {
    return new Array(weekdays.length).fill(false);
  }

  return map(weekdays, (wd: Day) => {
    return days.includes(wd) ? wd : false;
  });
};
