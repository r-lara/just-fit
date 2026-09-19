
type UUID = string;

enum EUnitType {
  Weight = 'weight',
  Resistance = 'resistance',
  Distance = 'distance',
  Time = 'time',
  Reps = 'reps',
}

enum EMuscleGroup {
  Chest = 'chest',
  Back = 'back',
  Shoulders = 'shoulders',
  Neck = 'neck',
  Arms = 'arms',
  Core = 'core',
  Legs = 'legs',
  FullBody = 'full_body',
}

enum EExerciseCategory {
  Push = 'push',
  Pull = 'pull',
  Legs = 'legs',
  Core = 'core',
  Cardio = 'cardio',
  FullBody = 'full_body',
}

enum EUnitSystem {
  Metric = 'metric',
  Imperial = 'imperial',
}

enum EPRType {
  OneRepMax = 'one_rep_max',
  MaxWeight = 'max_weight',
  MaxReps = 'max_reps',
  MaxVolume = 'max_volume',
  MaxDistance = 'max_distance',
  BestTime = 'best_time',
}

interface IUser {
  id: UUID;
  name: string;
  email: string;
  unitSystem?: EUnitSystem; // display preference only; unset defaults to Metric. All stored values are canonical SI (see ITarget).
}

interface IUnit {
  id: UUID;
  label: string;
  code: string;
  type: EUnitType;
}

interface IMuscle {
  id: UUID;
  label: string;
  group: EMuscleGroup;
}

// All values below are canonical SI units, regardless of IUser.unitSystem: convert only at the display/input layer.
interface ITargetReps {
  type: EUnitType.Reps;
  reps: number;
}

interface ITargetWeight {
  type: EUnitType.Weight;
  weight: number; // kilograms
  reps: number;
}

interface ITargetResistance {
  type: EUnitType.Resistance;
  resistance: number; // kilograms
  reps: number;
}

interface ITargetDistance {
  type: EUnitType.Distance;
  distance: number; // meters
}

interface ITargetTime {
  type: EUnitType.Time;
  duration: number; // seconds
}

type ITarget = ITargetReps | ITargetWeight | ITargetResistance | ITargetDistance | ITargetTime;

interface IExercise {
  id: UUID;
  label: string;
  desc: string;
  imgs: string[];
  type: 'public' | 'private';
  user: IUser | null;
  targets: IMuscle[];
  unit: EUnitType;
  category: EExerciseCategory;
}

interface IWorkoutSet {
  id: UUID;
  exercise: IExercise;
  order: number;
  groupSet: number; // sets that form a superset (executed back-to-back).
  rest: number;
  target: ITarget;
}

interface IWorkout {
  id: UUID;
  user: IUser | null;
  type: 'public' | 'private';
  label?: string;
  desc?: string;
  sets: IWorkoutSet[];
}

// Log: what was actually performed. Kept separate from the template so history
// survives edits/deletes of the underlying IWorkout and IWorkoutSet.
interface ISetLog {
  id: UUID;
  plannedSet?: IWorkoutSet;
  exercise: IExercise;
  order: number;
  groupSet: number;
  actual: ITarget;
  rpe?: number;
}

interface IWorkoutLog {
  id: UUID;
  user: IUser;
  workout?: IWorkout;
  startedAt: Date;
  completedAt?: Date;
  sets: ISetLog[];
}

interface IPersonalRecord {
  id: UUID;
  user: IUser;
  exercise: IExercise;
  type: EPRType;
  value: number;
  unit: IUnit;
  achievedAt: Date;
  source: ISetLog;
}

interface IMeasurementType {
  id: UUID;
  label: string;
  user: IUser;
  unit: IUnit;
}

// A user has many IMeasurementLog entries over time (the time series is the progress data).
interface IMeasurementLog {
  id: UUID;
  user: IUser;
  type: IMeasurementType;
  value: number;
  recordedAt: Date;
}
