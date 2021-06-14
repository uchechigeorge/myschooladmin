import { ThemePalette } from '@angular/material/core';
import { AbstractControl } from '@angular/forms';

export interface IListDetailsOptions{
  title: string,
  id?: any,
  subtitle?: string,
  button?: boolean,
  icon?: string,
  iconSrc?: string,
  hasHeader?: boolean,
  toggle?: boolean,
  disabled?: boolean,
  header?: string,
  showSecondaryIcon?: boolean,
  secondaryIcon?: string,
  handler?: () => void,
}

export interface IEditInput{
  id?: any,
  model: any,
  value?: string,
  formControl?: AbstractControl,
  type?: 'text' | 'email' | 'number' | 'password' | 'date' | 'select' | 'textarea',
  inputmode?: string,
  directives?: IInputDirectives,
  icon?: string,
  okText?: string,
  cancelText?: string,
  label?: string,
  maxLength?: number | string,
  noEdit?: boolean,
  suffix?: string,
  hasHeader?: boolean,
  headerTitle?: string,
  isValid?: boolean,
  canUpdate?: boolean,
  secondaryIcon?: string,
  secondaryText?: string,
  showSecondaryBtn?: boolean,
  valiators?: IValidatorTypes[],
  selectOptions?: ISelectOptions[] | ISelectMultipleOptions[],
  selectMultiple?: boolean,
  multipleSelectOptions?: boolean,
  updateInput?: () => Promise<boolean | void>,
  inputChange?: (e?: { event: any, model: any }) => void,
  inputBlur?: (e?: any) => void,
  secondaryBtnCLick?: (e) => void,
}

export interface ISelectOptions{
  text?: string,
  value?: string,
}

export interface ISelectMultipleOptions{
  label?: string,
  options?: ISelectOptions[],
}

export type IValidatorTypes = 'email' | 'required' | 'maxLength' | 'negative' | 'isNan' | 'currency' | 'none';
export type IInputDirectives = 'currency' | 'scratch-card';

export interface CheckboxTask {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: CheckboxTask[];
}
