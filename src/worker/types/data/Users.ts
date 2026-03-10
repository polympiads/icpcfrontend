
export type Account = {
  id : string;
  name : string;
  type : "team" | "judge";
};

export type Team = {
  /* Id of the account */
  id : string;
  name : string;
  display_name ?: string;
};
