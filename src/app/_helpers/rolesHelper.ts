import { Role } from "../_models/role";
import { User } from "../_models/user";

export class RolesHelper{
  availableRoles: Role[] = [
    new Role('Admin'),
    new Role('Moderator'),
    new Role('Member')
  ]

  constructor(){}

  public getRolesArray(user: User){
    const returnRoles: Role[] = [];
    const userRoles = user.roles;

    this.availableRoles.forEach(role => {
      let isMatch = false;

      for(const userRole of userRoles){
        if (role.name == userRole){
          isMatch = true;
          role.checked = true;
          returnRoles.push(role);
          break;
        }
      }
      if (!isMatch){
        role.checked = false;
        returnRoles.push(role);
      }
    })
    return returnRoles;
  }
}
