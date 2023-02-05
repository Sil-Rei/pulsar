import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatCheckService {

  constructor() { }

  checkIfValidName(stringInput){
    if(String(stringInput).length > 20){
      return {false: " shouldn't be longer than 20 chars"};
    }else if(!(/^[\x00-\x7F]*$/.test(String(stringInput)))){
      return {false: "name contains unvalid characters"};
    }else{
      return true;
    }
  }

  checkIfValidNumber(num){
    if(String(num).match(/^-?\d+$/)){
      //valid integer (positive or negative)
      return true;
    }else if(String(num).match(/^\d+\.\d+$/)){
      return true;
    }else{
      return false;
    }
  }
}
