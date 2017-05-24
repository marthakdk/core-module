export class Data {
  response:string;
  status: any;
  constructor(json) {
    this.status = json.status;
  }
}