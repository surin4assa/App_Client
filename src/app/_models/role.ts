
export class Role
{
  name: string;
  value: string;
  checked: boolean = false;

  constructor(role: string){
    this.name = role;
    this.value = role;
  }
}
