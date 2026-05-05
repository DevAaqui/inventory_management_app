import "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    userId?: string;
    organizationId?: string;
    isLoggedIn?: boolean;
  }
}
