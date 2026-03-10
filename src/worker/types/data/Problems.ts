
export type Statement = {
  href: string;
  mime: "application/pdf"
};

export type Problem = {
  id    : string;
  label : string;
  name  : string;

  /* Time Limit in seconds */
  time_limit : number;
  /* Memory Limit in MiB */
  memory_limit : number;

  statement : Statement[];
};
