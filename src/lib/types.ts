export type CycleEntry = {
  id: string;
  /** ISO date string (yyyy-mm-dd) for the first day of that period */
  startDate: string;
  periodLength: number;
};

export type CalculatorResult = {
  lastPeriodStart: Date;
  periodLength: number;
  cycleLength: number;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
};
