
interface WhoAmI_NoAuth {
  is_authenticated : false;
};
interface WhoAmI_Auth {
  is_authenticated : true;

  id : string;
  username : string;
  is_staff : boolean;

  display_name ?: string;
};

export type WhoAmI = WhoAmI_Auth | WhoAmI_NoAuth;

function areWhoAmI_AuthEquall (whoAmI1: WhoAmI_Auth, whoAmI2: WhoAmI_Auth) {
  return whoAmI1.is_staff == whoAmI2.is_staff
      && whoAmI1.username == whoAmI2.username
      && whoAmI1.display_name == whoAmI2.display_name;
}
export function areWhoAmIEqual (whoAmI1: WhoAmI, whoAmI2: WhoAmI) {
  if (whoAmI1.is_authenticated != whoAmI2.is_authenticated) {
    return false;
  }

  if (whoAmI1.is_authenticated) {
    return areWhoAmI_AuthEquall(whoAmI1, whoAmI2 as WhoAmI_Auth);
  }

  return true;
}
