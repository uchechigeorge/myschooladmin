import { AbstractControl, FormArray } from '@angular/forms';

export const matchParent = (c: AbstractControl): { matchParent: boolean } => {
  // Error matcher to detect if the name of the parent class is same as a branch
  const value = c.value as string;
  const parent = c.parent?.parent?.parent;

  if(!parent) return;
  const className = parent.get('className');
  if(value == null || value == '' || className.value == null) return;

  
  if(normalizeClass(value) == normalizeClass(className.value)) {
    return { matchParent: true };
  }
}

export const matchChild = (c: AbstractControl): { matchChild: boolean} => {
  const value = c.value as string;
  const hasChildren = c.parent?.get('hasChildren').value as boolean;
  if(!hasChildren) return;

  const childControls = c.parent?.get('classBranches') as FormArray;
  if(!childControls) return;

  const childValues: string[] = [];
    childControls?.value.forEach(value => {
    childValues.push(value.classBranch);
  });

  let hasMatch = checkChildMatch(childValues, value).hasMatch;
  if(!hasMatch) return;

  let matches = checkChildMatch(childValues, value).matches;
  childControls.controls.forEach(control => {
    let controlValue = normalizeClass(control.value.classBranch);
    if(arrayContains(matches, controlValue)) {
      control.get('classBranch').setErrors({ matchParent: true });
    }
  });

}

export const matchSibling = (c: AbstractControl) => {
// Error matcher to detect if the name of the branch class is same as another branch
  const formArray = c as FormArray;
  const childControls = formArray.controls;

  const siblingValues: string[] = [];

  formArray.value.forEach(value => {
    siblingValues.push(value.classBranch);
  });
  
  let hasDuplicate = checkDuplicate(siblingValues).hasDuplicate;
  if(!hasDuplicate) return;

  let duplicates = checkDuplicate(siblingValues).duplicates;

  childControls.forEach(control => {
    let controlValue = normalizeClass(control.value.classBranch);
    if(arrayContains(duplicates, controlValue)) {
      control.get('classBranch').setErrors({ matchSibling: true });
    }
  });

  return {
    matchSibling: true
  }
}

const normalizeClass = (value: string) => {
  return value?.toLowerCase().replace(/\s/g, '');
}

const checkDuplicate = (values: string[]): { hasDuplicate: boolean, duplicates?: string[] } => {
  const valuesMap = {};
  let duplicates: string[] = [];

  let hasDuplicate = false;
  let maxNum = 0;
  values.forEach(value => {
    if(valuesMap[normalizeClass(value)]) {
      valuesMap[normalizeClass(value)]++;
    }
    else {
      valuesMap[normalizeClass(value)] = 1;
    }
  });

  for (const value in valuesMap) {
    if(valuesMap[value] > 1) {
      // maxNum = valuesMap[value];
      duplicates.push(value);
      hasDuplicate = true;
    }
  }

  return{
    hasDuplicate,
    duplicates
  }
}

const arrayContains = (array: any[], value: any) => {
  return array.some(arrayValue => arrayValue == value);
}

const checkChildMatch = (values: string[], matchValue: string): { hasMatch: boolean, matches?: string[] } => {
  let hasMatch: boolean;
  let matches: string[] = [];
 
  values.forEach(value => {
    if(normalizeClass(value) == normalizeClass(matchValue)) {
      hasMatch = true;
      matches.push(normalizeClass(value));
    }
  });

  return {
    hasMatch,
    matches
  }
}