
interface WhoAmI_NoAuth {
  is_authenticated : false;
};
interface WhoAmI_Auth {
  is_authenticated : true;

  username : string;
  is_staff : boolean;

  display_name ?: string;
};

export type WhoAmI = WhoAmI_Auth | WhoAmI_NoAuth;
