// export interface IClassModel{
//   [ key: string ]: string | string[] | null
// }

export class IClassModel{
  class: string;
  children?: string[];
  hasChildren?: boolean = this.children.length > 0 || this.children !== null;
}

export interface ICourseModel{
  name: string,
  class: string
}

export class IClassPayments{
  class: string;
  amount?: number;
  children?: ISubClassPayment[]
  hasChildren?: boolean = this.children.length > 0 || this.children !== null;
}

export interface ISubClassPayment{
  class?: string,
  amount?: number,
}